import { Link } from 'react-router-dom';
import { ShoppingCart, User, QrCode, LayoutDashboard, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { user, cart, logout } = useApp();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <QrCode className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Smart Retail</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to="/shop" className="text-gray-700 hover:text-primary-600 font-medium">
              Shop
            </Link>
            
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-primary-600 font-medium flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}
            
            {user && (user.role === 'admin' || user.role === 'staff') && (
              <Link to="/verification" className="text-gray-700 hover:text-primary-600 font-medium">
                Verify Exit
              </Link>
            )}

            <Link to="/exchange" className="text-gray-700 hover:text-primary-600 font-medium">
              Exchange
            </Link>

            <Link to="/my-bills" className="text-gray-700 hover:text-primary-600 font-medium">
              My Bills
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-primary-600">
              <ShoppingCart className="w-6 h-6" />
              {cart.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.items.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
