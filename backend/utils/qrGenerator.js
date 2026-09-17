const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate QR code as data URL
 */
const generateQRCode = async (data) => {
  try {
    const qrDataURL = await QRCode.toDataURL(JSON.stringify(data), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1
    });
    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate product QR code
 */
const generateProductQR = async (product) => {
  const qrData = {
    type: 'product',
    productId: product._id.toString(),
    sku: product.sku,
    name: product.name,
    price: product.price
  };
  return await generateQRCode(qrData);
};

/**
 * Generate order verification QR code
 */
const generateVerificationQR = async (order) => {
  const qrData = {
    type: 'verification',
    orderId: order._id.toString(),
    orderNumber: order.orderId,
    amount: order.totalAmount,
    timestamp: new Date().toISOString()
  };
  return await generateQRCode(qrData);
};

/**
 * Generate UPI payment QR code
 */
const generateUPIQR = async (orderData) => {
  // UPI QR format: upi://pay?pa=merchant@upi&pn=MerchantName&am=amount&cu=INR&tn=OrderID
  const upiString = `upi://pay?pa=smartretail@upi&pn=Smart Retail Store&am=${orderData.amount}&cu=INR&tn=${orderData.orderId}`;
  
  const qrDataURL = await QRCode.toDataURL(upiString, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 400
  });
  
  return qrDataURL;
};

/**
 * Generate unique order ID
 */
const generateOrderId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Generate unique exchange ID
 */
const generateExchangeId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `EXG-${timestamp}-${random}`;
};

module.exports = {
  generateQRCode,
  generateProductQR,
  generateVerificationQR,
  generateUPIQR,
  generateOrderId,
  generateExchangeId
};
