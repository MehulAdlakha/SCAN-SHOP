import { useState, useEffect } from 'react';
import { Download, RefreshCw, FileText, Clock, CheckCircle } from 'lucide-react';
import { orderAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyBillsPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadBill = (billUrl) => {
    window.open(`http://localhost:5001${billUrl}`, '_blank');
  };

  const handleExchange = (orderId) => {
    navigate(`/exchange?orderId=${orderId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const isExchangeable = (order) => {
    const orderDate = new Date(order.createdAt);
    const hoursSinceOrder = (Date.now() - orderDate) / (1000 * 60 * 60);
    return hoursSinceOrder < 24 && order.verificationStatus === 'verified';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bills</h1>
              <p className="text-gray-600 mt-1">View and manage your purchase history</p>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bills Yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your purchase history here</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">Order #{order.orderId}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.verificationStatus)}`}>
                        {order.verificationStatus}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <span>•</span>
                      <span>{order.items.length} items</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">₹{order.total.toFixed(2)}</div>
                    {order.verificationStatus === 'verified' && (
                      <div className="flex items-center space-x-1 text-green-600 text-sm mt-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="text-gray-700">{item.name} × {item.quantity}</span>
                        <span className="font-semibold">₹{(item.priceWithTax * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {order.billPdfUrl && (
                    <button
                      onClick={() => downloadBill(order.billPdfUrl)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Bill</span>
                    </button>
                  )}

                  {isExchangeable(order) && (
                    <button
                      onClick={() => handleExchange(order.orderId)}
                      className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Exchange Items</span>
                    </button>
                  )}

                  {order.verificationQRCode && order.verificationStatus === 'pending' && (
                    <button
                      onClick={() => navigate(`/order-success/${order._id}`)}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Exit QR</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
