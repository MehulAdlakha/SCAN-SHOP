import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminExchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    try {
      const response = await adminAPI.getExchanges();
      setExchanges(response.data.data);
    } catch (error) {
      console.error('Error fetching exchanges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Exchange History</h1>

      {exchanges.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-600">No exchanges yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {exchanges.map((exchange) => (
            <div key={exchange._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Exchange ID</p>
                  <p className="font-semibold">{exchange.exchangeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Original Order</p>
                  <p className="font-semibold">{exchange.originalOrderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    exchange.status === 'completed' ? 'bg-green-100 text-green-800' :
                    exchange.status === 'initiated' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {exchange.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(exchange.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-2">Exchange Items</h3>
                <div className="space-y-2">
                  {exchange.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-red-600">
                          Old: {item.originalProductName} (Qty: {item.originalQuantity})
                        </p>
                        <p className="text-sm font-medium text-green-600">
                          New: {item.newProductName} (Qty: {item.newQuantity})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">₹{item.originalPrice.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">₹{item.newPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Price Difference</span>
                  <span className={`text-xl font-bold ${
                    exchange.priceDifference > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {exchange.priceDifference > 0 ? '+' : ''}₹{Math.abs(exchange.priceDifference).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {exchange.adjustmentType === 'payment' && 'Customer paid difference'}
                  {exchange.adjustmentType === 'credit' && `Store credit: ₹${exchange.storeCreditAmount.toFixed(2)}`}
                  {exchange.adjustmentType === 'even' && 'No payment required'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminExchanges;
