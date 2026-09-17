const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const Exchange = require('../models/Exchange');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// All routes require admin authentication
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ paymentStatus: 'completed' });
    const totalExchanges = await Exchange.countDocuments();

    // Calculate revenue
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderId totalAmount paymentStatus createdAt');

    // Orders by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const ordersByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalOrders,
          completedOrders,
          totalExchanges,
          totalRevenue
        },
        recentOrders,
        ordersByDay
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Sales report
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = { paymentStatus: 'completed' };
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sales = await Order.find(dateFilter)
      .sort({ createdAt: -1 })
      .select('orderId customerEmail totalAmount createdAt items');

    const totalSales = sales.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      success: true,
      data: {
        count: sales.length,
        totalSales,
        sales
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Exchange history
router.get('/exchanges', async (req, res) => {
  try {
    const exchanges = await Exchange.find()
      .sort({ createdAt: -1 })
      .populate('originalOrderId', 'orderId totalAmount')
      .populate('newOrderId', 'orderId totalAmount');

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

// Product performance
router.get('/products/performance', async (req, res) => {
  try {
    const productSales = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: productSales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
