const mongoose = require('mongoose');

const exchangeItemSchema = new mongoose.Schema({
  originalProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  originalProductName: String,
  originalQuantity: Number,
  originalPrice: Number,
  newProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  newProductName: String,
  newQuantity: Number,
  newPrice: Number
});

const exchangeSchema = new mongoose.Schema({
  exchangeId: {
    type: String,
    required: true,
    unique: true
  },
  originalOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  originalOrderNumber: String,
  items: [exchangeItemSchema],
  priceDifference: {
    type: Number,
    required: true // Positive = customer pays, Negative = store credit
  },
  adjustmentType: {
    type: String,
    enum: ['payment', 'credit', 'even'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'credited'],
    default: 'pending'
  },
  storeCreditAmount: {
    type: Number,
    default: 0
  },
  newOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  newVerificationQR: String,
  status: {
    type: String,
    enum: ['initiated', 'completed', 'cancelled'],
    default: 'initiated'
  },
  exchangeWindowExpiry: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exchange', exchangeSchema);
