import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function FloatingCart() {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [bounce, setBounce] = useState(false);

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.priceWithTax * item.quantity), 0) || 0;

  // Bounce animation when cart updates
  useEffect(() => {
    if (totalItems > 0) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (totalItems === 0) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-primary-600 text-white rounded-full p-4 shadow-2xl hover:bg-primary-700 transition-all z-40 ${
          bounce ? 'animate-bounce' : ''
        }`}
        aria-label="Open cart"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        </div>
        <div className="absolute -top-10 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
          ₹{subtotal.toFixed(2)}
        </div>
      </button>

      {/* Cart Drawer Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Cart Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-primary-600 text-white p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Your Cart</h2>
                <p className="text-sm opacity-90">{totalItems} items</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-primary-700 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">₹{item.priceWithTax} × {item.quantity}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 bg-white rounded-lg px-3 py-1 shadow-sm">
                      <button
                        onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                        className="text-primary-600 hover:text-primary-700 p-1"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                        className="text-primary-600 hover:text-primary-700 p-1"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-lg text-gray-900">
                      ₹{(item.priceWithTax * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with Totals */}
            <div className="border-t bg-white p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{cart.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{cart.tax?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">₹{cart.total?.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/cart');
                  }}
                  className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  View Cart
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/checkout');
                  }}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
