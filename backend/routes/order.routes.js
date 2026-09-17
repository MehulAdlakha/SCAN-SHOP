const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { generateOrderId, generateVerificationQR, generateUPIQR } = require('../utils/qrGenerator');
const { generateBillPDF } = require('../utils/pdfGenerator');

// Create order
router.post('/create', async (req, res) => {
  try {
    const { items, customerEmail, customerPhone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate totals
    const orderItems = items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      taxRate: item.taxRate,
      taxAmount: (item.price * item.quantity * item.taxRate) / 100,
      totalAmount: item.price * item.quantity + (item.price * item.quantity * item.taxRate) / 100
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalTax = orderItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = subtotal + totalTax;

    // Create order
    const order = new Order({
      orderId: generateOrderId(),
      customerEmail,
      customerPhone,
      items: orderItems,
      subtotal,
      totalTax,
      totalAmount,
      paymentStatus: 'pending'
    });

    await order.save();

    // Generate UPI QR for payment
    const upiQR = await generateUPIQR({
      orderId: order.orderId,
      amount: totalAmount
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        upiQR
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Confirm payment
router.post('/:orderId/confirm-payment', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already confirmed'
      });
    }

    // Update order
    order.paymentStatus = 'completed';
    
    // Generate verification QR with 10-minute expiry
    order.verificationQR = await generateVerificationQR(order);
    order.verificationQRExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Generate bill PDF
    try {
      const billFileName = await generateBillPDF(order);
      order.billPdfUrl = `/uploads/${billFileName}`;
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      // Continue even if PDF fails
    }

    await order.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        order,
        verificationQR: order.verificationQR,
        billUrl: order.billPdfUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = {};
    if (status) {
      query.paymentStatus = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get order bill PDF
router.get('/:orderId/bill', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.billPdfUrl) {
      return res.status(404).json({
        success: false,
        message: 'Bill not generated yet'
      });
    }

    res.json({
      success: true,
      data: {
        billUrl: order.billPdfUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
