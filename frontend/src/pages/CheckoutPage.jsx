import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
  const [orderData, setOrderData] = useState(null);
  const [upiQR, setUpiQR] = useState('');
  
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    phone: '',
  });

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create order
      const response = await orderAPI.create({
        items: cart.items,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
      });

      setOrderData(response.data.data.order);
      setUpiQR(response.data.data.upiQR);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      // Confirm payment
      await orderAPI.confirmPayment(orderData.orderId);
      clearCart();
      navigate(`/order-success/${orderData.orderId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <Step number={1} label="Information" active={step >= 1} completed={step > 1} />
        <div className={`w-24 h-1 ${step > 1 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
        <Step number={2} label="Payment" active={step >= 2} completed={step > 2} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Customer Information */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Information</h2>
          
          <form onSubmit={handleInfoSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (for bill)
                </label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="input-field"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                {cart.items.map(item => (
                  <div key={item.productId} className="flex justify-between">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total (incl. tax)</span>
                  <span>₹{cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Payment</h2>
          
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">Scan the QR code with any UPI app to pay</p>
            
            {upiQR && (
              <div className="inline-block bg-white p-4 rounded-xl shadow-lg">
                <img src={upiQR} alt="UPI Payment QR" className="w-64 h-64 mx-auto" />
              </div>
            )}

            <div className="mt-6">
              <p className="text-2xl font-bold text-gray-900">₹{orderData?.totalAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Order ID: {orderData?.orderId}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a demo. In production, payment status would be verified automatically. 
              Click "I've Completed Payment" to continue.
            </p>
          </div>

          <button
            onClick={handlePaymentConfirm}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Verifying...' : "I've Completed Payment"}
          </button>
        </div>
      )}
    </div>
  );
};

const Step = ({ number, label, active, completed }) => (
  <div className="flex flex-col items-center">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
      completed ? 'bg-primary-600 text-white' :
      active ? 'bg-primary-600 text-white' :
      'bg-gray-300 text-gray-600'
    }`}>
      {completed ? '✓' : number}
    </div>
    <span className="text-xs mt-1 text-gray-600">{label}</span>
  </div>
);

export default CheckoutPage;
