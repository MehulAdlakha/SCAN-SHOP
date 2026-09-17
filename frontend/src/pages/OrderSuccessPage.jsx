import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { CheckCircle, Download, Mail, Clock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import QRCode from 'qrcode.react';
import CountdownTimer from '../components/CountdownTimer';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getById(orderId);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Message */}
      <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 mb-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600">Thank you for shopping with Smart Retail</p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-semibold text-gray-900">{order.orderId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Order Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          {order.customerEmail && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{order.customerEmail}</p>
            </div>
          )}
          {order.customerPhone && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Phone</p>
              <p className="font-semibold text-gray-900">{order.customerPhone}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Items</h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.productName} × {item.quantity}</span>
                <span>₹{item.totalAmount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total Paid</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Exit Verification QR */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          Exit Verification QR Code
        </h2>
        
        {/* Timer */}
        {order.verificationQRExpiry && (
          <div className="flex justify-center mb-4">
            <CountdownTimer expiryTime={order.verificationQRExpiry} />
          </div>
        )}
        
        <p className="text-center text-gray-600 mb-6">
          Show this QR code to staff at the exit for verification
        </p>

        <div className="flex justify-center mb-6">
          {order.verificationQR ? (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <img src={order.verificationQR} alt="Verification QR" className="w-64 h-64" />
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <QRCode value={order.orderId} size={256} />
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Important:</strong> This QR code is valid for 10 minutes only. Show it at the exit before it expires.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid md:grid-cols-2 gap-4">
          {order.billPdfUrl && (
            <a
              href={order.billPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Bill
            </a>
          )}
          
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Need to exchange a product?{' '}
            <Link to="/exchange" className="text-primary-600 hover:text-primary-700 font-semibold">
              Click here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
