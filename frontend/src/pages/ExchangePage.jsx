import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { exchangeAPI, productAPI } from '../services/api';
import { QrCode, RefreshCw, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const ExchangePage = () => {
  const [step, setStep] = useState(1); // 1: Scan Bill, 2: Select Items, 3: Payment/Credit
  const [originalOrder, setOriginalOrder] = useState(null);
  const [exchangeData, setExchangeData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showProductScanner, setShowProductScanner] = useState(false);

  const startBillScanner = () => {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('bill-qr-reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      });

      scanner.render(onBillScanSuccess, onScanError);

      async function onBillScanSuccess(decodedText) {
        try {
          const qrData = JSON.parse(decodedText);
          if (qrData.type === 'verification' || qrData.orderNumber) {
            const orderId = qrData.orderNumber || decodedText;
            await initiateExchange(orderId);
            scanner.clear();
            setShowScanner(false);
          }
        } catch (error) {
          // Try as plain order ID
          await initiateExchange(decodedText);
          scanner.clear();
          setShowScanner(false);
        }
      }

      function onScanError(error) {
        // Silent
      }
    }, 100);
  };

  const initiateExchange = async (orderId) => {
    setLoading(true);
    setError('');

    try {
      const response = await exchangeAPI.initiate(orderId);
      setOriginalOrder(response.data.data.order);
      
      // Fetch available products
      const productsRes = await productAPI.getAll({ isActive: true });
      setProducts(productsRes.data.data);
      
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate exchange');
    } finally {
      setLoading(false);
    }
  };

  const selectItemForExchange = (item) => {
    setSelectedItems([...selectedItems, {
      originalItem: item,
      newProduct: null,
      newQuantity: item.quantity
    }]);
  };

  const selectNewProduct = (index, product) => {
    const updated = [...selectedItems];
    updated[index].newProduct = product;
    setSelectedItems(updated);
  };

  const processExchange = async () => {
    setLoading(true);
    setError('');

    try {
      const exchangeItems = selectedItems.map(item => ({
        originalProductId: item.originalItem.productId,
        originalQuantity: item.originalItem.quantity,
        newProductId: item.newProduct._id,
        newQuantity: item.newQuantity
      }));

      const response = await exchangeAPI.process({
        orderId: originalOrder.orderId,
        exchangeItems
      });

      setExchangeData(response.data.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process exchange');
    } finally {
      setLoading(false);
    }
  };

  const completeExchange = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await exchangeAPI.complete(exchangeData.exchange.exchangeId);
      setExchangeData({ ...exchangeData, ...response.data.data });
      alert('Exchange completed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete exchange');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Exchange</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Scan Bill */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center">
            <RefreshCw className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Exchange</h2>
            <p className="text-gray-600 mb-6">
              Scan your bill QR code or verification QR to initiate exchange
            </p>

            <button
              onClick={startBillScanner}
              className="btn-primary inline-flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              Scan Bill QR Code
            </button>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Exchanges are allowed within 24 hours of purchase
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Scan Bill QR Code</h2>
            <div id="bill-qr-reader" className="mb-4"></div>
            <button
              onClick={() => setShowScanner(false)}
              className="btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Items */}
      {step === 2 && originalOrder && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Original Order</h2>
            <p className="text-sm text-gray-600 mb-4">Order ID: {originalOrder.orderId}</p>
            
            <div className="space-y-3">
              {originalOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Price: ₹{item.totalAmount}</p>
                  </div>
                  
                  {!selectedItems.find(si => si.originalItem.productId === item.productId) && (
                    <button
                      onClick={() => selectItemForExchange(item)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      Exchange This
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select New Products</h2>
              
              {selectedItems.map((item, idx) => (
                <div key={idx} className="mb-6 p-4 border rounded-lg">
                  <p className="font-semibold mb-3">
                    Exchanging: {item.originalItem.productName}
                  </p>
                  
                  {!item.newProduct ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-2">Select replacement:</p>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {products.map(product => (
                          <button
                            key={product._id}
                            onClick={() => selectNewProduct(idx, product)}
                            className="text-left p-3 border rounded hover:border-primary-600 hover:bg-primary-50"
                          >
                            <p className="font-semibold text-sm">{product.name}</p>
                            <p className="text-xs text-gray-600">₹{product.price}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm text-green-800">
                        <strong>New product:</strong> {item.newProduct.name} - ₹{item.newProduct.price}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {selectedItems.every(item => item.newProduct) && (
                <button
                  onClick={processExchange}
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Calculate Exchange'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Payment/Credit */}
      {step === 3 && exchangeData && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Exchange Summary</h2>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Exchange ID</p>
            <p className="font-semibold">{exchangeData.exchange.exchangeId}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Price Difference</p>
              <p className={`text-3xl font-bold ${
                exchangeData.priceDifference > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {exchangeData.priceDifference > 0 ? '+' : ''}₹{Math.abs(exchangeData.priceDifference).toFixed(2)}
              </p>
              
              {exchangeData.requiresPayment ? (
                <p className="text-sm text-gray-600 mt-2">You need to pay this amount</p>
              ) : exchangeData.exchange.adjustmentType === 'credit' ? (
                <p className="text-sm text-gray-600 mt-2">Store credit will be issued</p>
              ) : (
                <p className="text-sm text-gray-600 mt-2">No additional payment needed</p>
              )}
            </div>
          </div>

          {exchangeData.upiQR && (
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">Scan to pay the difference</p>
              <img src={exchangeData.upiQR} alt="Payment QR" className="w-64 h-64 mx-auto" />
            </div>
          )}

          <button
            onClick={completeExchange}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Complete Exchange'}
          </button>

          {exchangeData.exchange.newVerificationQR && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">New Verification QR</p>
              <img src={exchangeData.exchange.newVerificationQR} alt="New QR" className="w-48 h-48 mx-auto" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExchangePage;
