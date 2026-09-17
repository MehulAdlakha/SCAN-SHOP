const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  taxRate: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerEmail: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  totalTax: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'UPI'
  },
  verificationQR: {
    type: String
  },
  verificationQRExpiry: {
    type: Date,
    default: null
  },
  billPdfUrl: {
    type: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  fraudAttempts: {
    type: [{
      type: String,
      timestamp: Date,
      reason: String
    }],
    default: []
  },
  verifiedBy: {
    type: String
  },
  isExchanged: {
    type: Boolean,
    default: false
  },
  exchangeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exchange'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
