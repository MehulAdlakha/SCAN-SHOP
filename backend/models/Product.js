const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  qrCode: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  taxRate: {
    type: Number,
    default: 18, // 18% GST
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  scanCount: {
    type: Number,
    default: 0
  },
  lastScannedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Virtual for price with tax
productSchema.virtual('priceWithTax').get(function() {
  return this.price + (this.price * this.taxRate / 100);
});

module.exports = mongoose.model('Product', productSchema);
