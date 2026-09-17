const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Track product scan
router.post('/track-scan', async (req, res) => {
  try {
    const { productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!product.scanCount) product.scanCount = 0;
    product.scanCount += 1;
    product.lastScannedAt = new Date();
    await product.save();

    res.json({ success: true, scanCount: product.scanCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get heatmap analytics (admin only)
router.get('/heatmap', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Product scan frequency
    const topScannedProducts = await Product.find({ scanCount: { $gt: 0 } })
      .sort({ scanCount: -1 })
      .limit(10)
      .select('name scanCount lastScannedAt');

    // Peak shopping times (orders grouped by hour)
    const orders = await Order.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    
    const hourlyActivity = Array(24).fill(0);
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyActivity[hour]++;
    });

    // Daily activity (last 7 days)
    const dailyActivity = Array(7).fill(0);
    orders.forEach(order => {
      const daysAgo = Math.floor((Date.now() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));
      if (daysAgo < 7) {
        dailyActivity[6 - daysAgo]++;
      }
    });

    // Most exchanged products
    const Exchange = require('../models/Exchange');
    const exchanges = await Exchange.find().populate('originalItems.productId').populate('newItems.productId');
    
    const exchangeCount = {};
    exchanges.forEach(ex => {
      ex.originalItems.forEach(item => {
        const id = item.productId._id.toString();
        exchangeCount[id] = (exchangeCount[id] || 0) + 1;
      });
    });

    const mostExchanged = Object.entries(exchangeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, count]) => ({
        productId,
        count,
        product: exchanges.find(ex => ex.originalItems.some(item => item.productId._id.toString() === productId))
          ?.originalItems.find(item => item.productId._id.toString() === productId)?.productId
      }));

    res.json({
      success: true,
      data: {
        topScannedProducts,
        hourlyActivity: hourlyActivity.map((count, hour) => ({
          hour: `${hour}:00`,
          orders: count
        })),
        dailyActivity: dailyActivity.map((count, index) => ({
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).getDay()],
          orders: count
        })),
        mostExchanged,
        peakHour: hourlyActivity.indexOf(Math.max(...hourlyActivity)),
        totalScans: topScannedProducts.reduce((sum, p) => sum + p.scanCount, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
