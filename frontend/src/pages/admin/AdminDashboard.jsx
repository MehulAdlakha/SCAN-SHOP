import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { Package, ShoppingBag, RefreshCw, DollarSign, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const stats = dashboardData?.stats || {};
  const recentOrders = dashboardData?.recentOrders || [];
  const ordersByDay = dashboardData?.ordersByDay || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Package className="w-8 h-8" />}
          label="Total Products"
          value={stats.totalProducts || 0}
          color="blue"
        />
        <StatCard
          icon={<ShoppingBag className="w-8 h-8" />}
          label="Total Orders"
          value={stats.totalOrders || 0}
          color="green"
        />
        <StatCard
          icon={<RefreshCw className="w-8 h-8" />}
          label="Exchanges"
          value={stats.totalExchanges || 0}
          color="purple"
        />
        <StatCard
          icon={<DollarSign className="w-8 h-8" />}
          label="Total Revenue"
          value={`₹${(stats.totalRevenue || 0).toFixed(2)}`}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/admin/products" className="btn-primary text-center">
            Manage Products
          </Link>
          <Link to="/admin/orders" className="btn-secondary text-center">
            View Orders
          </Link>
          <Link to="/admin/exchanges" className="btn-secondary text-center">
            View Exchanges
          </Link>
          <Link to="/admin/heatmap" className="btn-secondary text-center flex items-center justify-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics Heatmap</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderId}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Chart */}
      {ordersByDay.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Trend (Last 7 Days)</h2>
          <div className="space-y-3">
            {ordersByDay.map((day, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{day._id}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="bg-primary-500 h-8 rounded"
                      style={{ width: `${(day.revenue / Math.max(...ordersByDay.map(d => d.revenue))) * 100}%` }}
                    ></div>
                    <span className="text-sm font-semibold">₹{day.revenue.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">({day.count} orders)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
