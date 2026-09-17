import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { TrendingUp, Clock, RefreshCw, BarChart3 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getHeatmap();
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div>No data available</div>;

  const maxHourlyOrders = Math.max(...data.hourlyActivity.map(h => h.orders));
  const maxDailyOrders = Math.max(...data.dailyActivity.map(d => d.orders));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Heatmap</h1>
            <p className="text-gray-600 mt-1">Customer behavior and product insights</p>
          </div>
          <button
            onClick={fetchHeatmapData}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Scans</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{data.totalScans}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Peak Hour</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{data.peakHour}:00</p>
              </div>
              <Clock className="w-12 h-12 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Top Product</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {data.topScannedProducts[0]?.name || 'N/A'}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Activity Heatmap */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Peak Shopping Times (24h)</h2>
            <div className="space-y-2">
              {data.hourlyActivity.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600 w-12">{item.hour}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.orders === maxHourlyOrders 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                          : 'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`}
                      style={{ width: `${(item.orders / maxHourlyOrders) * 100}%` }}
                    >
                      {item.orders > 0 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold">
                          {item.orders}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Last 7 Days Activity</h2>
            <div className="flex justify-between items-end h-64 space-x-2">
              {data.dailyActivity.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500 hover:from-primary-700 hover:to-primary-500"
                      style={{ height: `${(item.orders / maxDailyOrders) * 100}%` }}
                    >
                      {item.orders > 0 && (
                        <div className="text-white text-xs font-bold text-center pt-2">
                          {item.orders}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Scanned Products */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Most Scanned Products</h2>
            <div className="space-y-3">
              {data.topScannedProducts.map((product, index) => (
                <div key={product._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {product.scanCount} scans
                      {product.lastScannedAt && (
                        <span className="ml-2">• Last: {new Date(product.lastScannedAt).toLocaleString()}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-primary-600">{product.scanCount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Exchanged Products */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Most Exchanged Products</h2>
            <div className="space-y-3">
              {data.mostExchanged.length > 0 ? (
                data.mostExchanged.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.product?.name || 'Product'}
                        </h3>
                        <p className="text-sm text-gray-600">{item.count} exchanges</p>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-red-600">{item.count}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-8">No exchange data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
