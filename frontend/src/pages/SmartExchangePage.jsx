import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { exchangeAPI, productAPI, orderAPI } from '../services/api';
import { Scan, ArrowRight, TrendingUp, TrendingDown, Minus, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SmartExchangePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Scan Bill, 2: Select Items, 3: Select New Products, 4: Confirm
  const [order, setOrder] = useState(null);
  const [selectedOriginalItems, setSelectedOriginalItems] = useState([]);
  const [selectedNewProducts, setSelectedNewProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [priceDifference, setPriceDifference] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showProductScanner, setShowProductScanner] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      loadOrderByOrderId(orderId);
    }
    loadProducts();
  }, [searchParams]);

  useEffect(() => {
    calculatePriceDifference();
  }, [selectedOriginalItems, selectedNewProducts]);

  const loadOrderByOrderId = async (orderId) => {
    try {
      setLoading(true);
      const response = await orderAPI.getByOrderId(orderId);
      setOrder(response.data.data);
      setStep(2);
    } catch (error) {
      setError('Order not found or not eligible for exchange');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const startBillScanner = () => {
    setShowScanner(true);
    setError('');

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('bill-qr-reader', {
        qrbox: 250,
        fps: 10,
      });

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setShowScanner(false);
          loadOrderByOrderId(decodedText);
        },
        (error) => {
          console.log('Scan error:', error);
        }
      );
    }, 100);
  };

  const startProductScanner = () => {
    setShowProductScanner(true);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('product-qr-reader', {
        qrbox: 250,
        fps: 10,
      });

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setShowProductScanner(false);
          const product = products.find(p => p.sku === decodedText || p._id === decodedText);
          if (product) {
            addNewProduct(product);
          } else {
            setError('Product not found');
          }
        },
        (error) => {
          console.log('Scan error:', error);
        }
      );
    }, 100);
  };

  const toggleOriginalItem = (item) => {
    setSelectedOriginalItems(prev => {
      const exists = prev.find(i => i.productId === item.productId);
      if (exists) {
        return prev.filter(i => i.productId !== item.productId);
      } else {
        return [...prev, item];
      }
    });
  };

  const addNewProduct = (product) => {
    setSelectedNewProducts(prev => {
      const exists = prev.find(p => p._id === product._id);
      if (exists) {
        return prev.map(p => 
          p._id === product._id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const updateNewProductQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedNewProducts(prev => prev.filter(p => p._id !== productId));
    } else {
      setSelectedNewProducts(prev =>
        prev.map(p => p._id === productId ? { ...p, quantity: newQuantity } : p)
      );
    }
  };

  const calculatePriceDifference = () => {
    const originalTotal = selectedOriginalItems.reduce((sum, item) => 
      sum + (item.priceWithTax * item.quantity), 0
    );
    const newTotal = selectedNewProducts.reduce((sum, product) => 
      sum + (product.priceWithTax * product.quantity), 0
    );
    setPriceDifference(newTotal - originalTotal);
  };

  const handleExchange = async () => {
    try {
      setLoading(true);
      const response = await exchangeAPI.initiate({
        orderId: order.orderId,
        originalItems: selectedOriginalItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        newItems: selectedNewProducts.map(product => ({
          productId: product._id,
          quantity: product.quantity
        }))
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/my-bills');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Exchange failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) return <LoadingSpinner />;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Exchange Successful!</h2>
          <p className="text-gray-600">Redirecting to My Bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Scan Bill</span>
            <span>Select Returns</span>
            <span>Select New</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Scan Bill */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Scan className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Scan Your Bill QR</h2>
            <p className="text-gray-600 mb-6">Scan the QR code from your purchase bill to start the exchange</p>
            <button onClick={startBillScanner} className="btn-primary">
              <Scan className="w-5 h-5" />
              Start Scanning
            </button>
          </div>
        )}

        {/* Step 2: Select Original Items */}
        {step === 2 && order && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Items to Return</h2>
            <div className="space-y-3 mb-6">
              {order.items.map((item) => (
                <div
                  key={item.productId}
                  onClick={() => toggleOriginalItem(item)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedOriginalItems.find(i => i.productId === item.productId)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{item.totalAmount.toFixed(2)}</p>
                      {selectedOriginalItems.find(i => i.productId === item.productId) && (
                        <span className="text-xs text-primary-600 font-semibold">✓ Selected</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(3)}
              disabled={selectedOriginalItems.length === 0}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Select New Products
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 3: Select New Products */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select New Products</h2>
              <button onClick={startProductScanner} className="btn-secondary mb-4">
                <Scan className="w-5 h-5" />
                Scan Product QR
              </button>

              {selectedNewProducts.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold text-gray-700">Selected New Products:</h3>
                  {selectedNewProducts.map((product) => (
                    <div key={product._id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-gray-600">₹{product.priceWithTax} each</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateNewProductQuantity(product._id, product.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg min-w-[3rem] text-center">{product.quantity}</span>
                          <button
                            onClick={() => updateNewProductQuantity(product._id, product.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Difference Animation */}
              {priceDifference !== 0 && (
                <div className={`p-4 rounded-lg mb-4 animate-pulse ${
                  priceDifference > 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-green-100 border-2 border-green-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {priceDifference > 0 ? (
                        <TrendingUp className="w-6 h-6 text-yellow-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-green-600" />
                      )}
                      <span className="font-semibold text-gray-900">Price Difference:</span>
                    </div>
                    <span className={`text-2xl font-bold ${priceDifference > 0 ? 'text-yellow-700' : 'text-green-700'}`}>
                      {priceDifference > 0 ? '+' : ''}₹{Math.abs(priceDifference).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {priceDifference > 0 
                      ? 'You need to pay the additional amount' 
                      : 'You will receive store credit'}
                  </p>
                </div>
              )}

              <button
                onClick={() => setStep(4)}
                disabled={selectedNewProducts.length === 0}
                className="btn-primary w-full disabled:opacity-50"
              >
                Review Exchange
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Exchange</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-red-600 mb-3">Returning:</h3>
                <div className="space-y-2">
                  {selectedOriginalItems.map((item) => (
                    <div key={item.productId} className="text-sm bg-red-50 p-2 rounded">
                      {item.productName} × {item.quantity}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-green-600 mb-3">Receiving:</h3>
                <div className="space-y-2">
                  {selectedNewProducts.map((product) => (
                    <div key={product._id} className="text-sm bg-green-50 p-2 rounded">
                      {product.name} × {product.quantity}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Final Amount:</span>
                <span className={priceDifference > 0 ? 'text-red-600' : 'text-green-600'}>
                  {priceDifference > 0 ? 'Pay ' : 'Credit '}₹{Math.abs(priceDifference).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleExchange}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : 'Confirm Exchange'}
            </button>
          </div>
        )}

        {/* Scanners */}
        {showScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div id="bill-qr-reader" className="mb-4"></div>
              <button onClick={() => setShowScanner(false)} className="btn-secondary w-full">
                Cancel
              </button>
            </div>
          </div>
        )}

        {showProductScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div id="product-qr-reader" className="mb-4"></div>
              <button onClick={() => setShowProductScanner(false)} className="btn-secondary w-full">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
