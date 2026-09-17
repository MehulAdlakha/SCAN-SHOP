const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware, staffMiddleware } = require('../middleware/auth.middleware');

// Verify exit QR (requires staff authentication)
router.post('/verify', authMiddleware, staffMiddleware, async (req, res) => {
  try {
    const { orderNumber } = req.body; // From scanned QR

    const order = await Order.findOne({ orderId: orderNumber }).populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Order not found'
      });
    }

    // Check payment status
    if (order.paymentStatus !== 'completed') {
      return res.json({
        success: false,
        verified: false,
        message: 'Payment not completed',
        fraudWarning: 'Unpaid order attempted verification',
        data: {
          order: {
            orderId: order.orderId,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount
          }
        }
      });
    }

    // Check QR expiry
    if (order.verificationQRExpiry && new Date() > new Date(order.verificationQRExpiry)) {
      if (!order.fraudAttempts) order.fraudAttempts = [];
      order.fraudAttempts.push({
        type: 'expired_qr',
        timestamp: new Date(),
        reason: 'Verification QR code expired'
      });
      await order.save();

      return res.json({
        success: false,
        verified: false,
        message: 'Verification QR expired',
        fraudWarning: '⚠️ EXPIRED QR - Valid for 10 minutes only',
        expiryTime: order.verificationQRExpiry,
        data: {
          order: {
            orderId: order.orderId,
            verificationQRExpiry: order.verificationQRExpiry,
            totalAmount: order.totalAmount
          }
        }
      });
    }

    // Check if already verified (QR reuse)
    if (order.isVerified) {
      if (!order.fraudAttempts) order.fraudAttempts = [];
      order.fraudAttempts.push({
        type: 'qr_reuse',
        timestamp: new Date(),
        reason: 'Already verified order attempted again'
      });
      await order.save();

      return res.json({
        success: false,
        verified: false,
        alreadyVerified: true,
        message: 'Already verified',
        fraudWarning: '⚠️ QR REUSE DETECTED - This bill was already scanned',
        data: {
          order: {
            orderId: order.orderId,
            verifiedAt: order.verifiedAt,
            verifiedBy: order.verifiedBy,
            items: order.items.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              totalAmount: item.totalAmount
            })),
            totalAmount: order.totalAmount
          }
        }
      });
    }

    // Mark as verified
    order.isVerified = true;
    order.verifiedAt = new Date();
    order.verifiedBy = req.user.name;
    await order.save();

    res.json({
      success: true,
      verified: true,
      message: '✅ Order verified successfully',
      data: {
        order: {
          orderId: order.orderId,
          verifiedAt: order.verifiedAt,
          verifiedBy: order.verifiedBy,
          items: order.items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            totalAmount: item.totalAmount
          })),
          totalAmount: order.totalAmount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      verified: false,
      message: error.message
    });
  }
});

// Public verification check (no auth - for customer to check status)
router.get('/check/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        isVerified: order.isVerified,
        verifiedAt: order.verifiedAt,
        verifiedBy: order.verifiedBy
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
