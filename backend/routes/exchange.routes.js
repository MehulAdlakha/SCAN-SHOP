const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Exchange = require('../models/Exchange');
const Product = require('../models/Product');
const { generateExchangeId, generateVerificationQR, generateUPIQR } = require('../utils/qrGenerator');

// Initiate exchange
router.post('/initiate', async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find original order
    const originalOrder = await Order.findOne({ orderId }).populate('items.productId');

    if (!originalOrder) {
      return res.status(404).json({
        success: false,
        message: 'Original order not found'
      });
    }

    if (originalOrder.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order payment not completed'
      });
    }

    if (originalOrder.isExchanged) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been exchanged'
      });
    }

    // Check exchange window (24 hours by default)
    const exchangeWindowHours = parseInt(process.env.EXCHANGE_WINDOW_HOURS) || 24;
    const orderDate = new Date(originalOrder.createdAt);
    const currentDate = new Date();
    const hoursDifference = (currentDate - orderDate) / (1000 * 60 * 60);

    if (hoursDifference > exchangeWindowHours) {
      return res.status(400).json({
        success: false,
        message: `Exchange window expired. Exchanges are allowed within ${exchangeWindowHours} hours of purchase.`
      });
    }

    res.json({
      success: true,
      message: 'Exchange can be initiated',
      data: {
        order: originalOrder,
        exchangeWindowExpiry: new Date(orderDate.getTime() + exchangeWindowHours * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Process exchange
router.post('/process', async (req, res) => {
  try {
    const { orderId, exchangeItems } = req.body;
    // exchangeItems: [{ originalProductId, originalQuantity, newProductId, newQuantity }]

    // Find original order
    const originalOrder = await Order.findOne({ orderId });

    if (!originalOrder) {
      return res.status(404).json({
        success: false,
        message: 'Original order not found'
      });
    }

    // Get product details
    const productIds = [
      ...exchangeItems.map(item => item.originalProductId),
      ...exchangeItems.map(item => item.newProductId)
    ];
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // Calculate price difference
    let originalTotal = 0;
    let newTotal = 0;

    const exchangeItemsData = exchangeItems.map(item => {
      const originalProduct = productMap.get(item.originalProductId);
      const newProduct = productMap.get(item.newProductId);

      const originalPrice = originalProduct.price * item.originalQuantity;
      const originalTax = (originalPrice * originalProduct.taxRate) / 100;
      const originalItemTotal = originalPrice + originalTax;

      const newPrice = newProduct.price * item.newQuantity;
      const newTax = (newPrice * newProduct.taxRate) / 100;
      const newItemTotal = newPrice + newTax;

      originalTotal += originalItemTotal;
      newTotal += newItemTotal;

      return {
        originalProductId: item.originalProductId,
        originalProductName: originalProduct.name,
        originalQuantity: item.originalQuantity,
        originalPrice: originalItemTotal,
        newProductId: item.newProductId,
        newProductName: newProduct.name,
        newQuantity: item.newQuantity,
        newPrice: newItemTotal
      };
    });

    const priceDifference = newTotal - originalTotal;

    let adjustmentType, paymentStatus, storeCreditAmount = 0, upiQR = null;

    if (priceDifference > 0) {
      adjustmentType = 'payment';
      paymentStatus = 'pending';
      // Generate UPI QR for additional payment
      upiQR = await generateUPIQR({
        orderId: `${orderId}-EXG`,
        amount: priceDifference
      });
    } else if (priceDifference < 0) {
      adjustmentType = 'credit';
      paymentStatus = 'credited';
      storeCreditAmount = Math.abs(priceDifference);
    } else {
      adjustmentType = 'even';
      paymentStatus = 'completed';
    }

    // Create exchange record
    const exchange = new Exchange({
      exchangeId: generateExchangeId(),
      originalOrderId: originalOrder._id,
      originalOrderNumber: originalOrder.orderId,
      items: exchangeItemsData,
      priceDifference,
      adjustmentType,
      paymentStatus,
      storeCreditAmount,
      exchangeWindowExpiry: new Date(Date.now() + parseInt(process.env.EXCHANGE_WINDOW_HOURS || 24) * 60 * 60 * 1000)
    });

    await exchange.save();

    res.json({
      success: true,
      message: 'Exchange initiated successfully',
      data: {
        exchange,
        upiQR,
        requiresPayment: priceDifference > 0,
        priceDifference: Math.abs(priceDifference)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Complete exchange
router.post('/:exchangeId/complete', async (req, res) => {
  try {
    const { exchangeId } = req.params;

    const exchange = await Exchange.findOne({ exchangeId });

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    if (exchange.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Exchange already completed'
      });
    }

    // Update exchange status
    exchange.status = 'completed';
    if (exchange.adjustmentType === 'payment') {
      exchange.paymentStatus = 'completed';
    }

    // Create new order for exchanged items
    const newOrderItems = exchange.items.map(item => {
      const product = { _id: item.newProductId };
      return {
        productId: item.newProductId,
        productName: item.newProductName,
        quantity: item.newQuantity,
        price: item.newPrice / item.newQuantity, // Unit price
        taxRate: 18, // Default
        taxAmount: (item.newPrice / item.newQuantity) * 0.18 * item.newQuantity,
        totalAmount: item.newPrice
      };
    });

    const newOrder = new Order({
      orderId: `${exchange.originalOrderNumber}-EXG`,
      items: newOrderItems,
      subtotal: exchange.items.reduce((sum, item) => sum + item.newPrice, 0),
      totalTax: 0, // Simplified
      totalAmount: exchange.items.reduce((sum, item) => sum + item.newPrice, 0),
      paymentStatus: 'completed',
      paymentMethod: 'Exchange'
    });

    newOrder.verificationQR = await generateVerificationQR(newOrder);
    await newOrder.save();

    exchange.newOrderId = newOrder._id;
    exchange.newVerificationQR = newOrder.verificationQR;
    await exchange.save();

    // Mark original order as exchanged
    const originalOrder = await Order.findById(exchange.originalOrderId);
    originalOrder.isExchanged = true;
    originalOrder.exchangeId = exchange._id;
    await originalOrder.save();

    res.json({
      success: true,
      message: 'Exchange completed successfully',
      data: {
        exchange,
        newOrder,
        verificationQR: newOrder.verificationQR
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get exchange details
router.get('/:exchangeId', async (req, res) => {
  try {
    const { exchangeId } = req.params;

    const exchange = await Exchange.findOne({ exchangeId })
      .populate('originalOrderId')
      .populate('newOrderId');

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    res.json({
      success: true,
      data: exchange
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all exchanges
router.get('/', async (req, res) => {
  try {
    const exchanges = await Exchange.find()
      .sort({ createdAt: -1 })
      .populate('originalOrderId');

    res.json({
      success: true,
      count: exchanges.length,
      data: exchanges
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
