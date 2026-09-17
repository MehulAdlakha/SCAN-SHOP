import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { productAPI, analyticsAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { QrCode, ShoppingCart, Search, Filter } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import SmartRecommendations from '../components/SmartRecommendations';

const ShopPage = () => {
  const { addToCart } = useApp();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll({ isActive: true });
      setProducts(response.data.data);
      setFilteredProducts(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    addToCart({
      productId: product._id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      taxRate: product.taxRate,
    });
    showMessage(`${product.name} added to cart!`);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const startScanner = () => {
    setShowScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      });

      scanner.render(onScanSuccess, onScanError);

      function onScanSuccess(decodedText) {
        try {
          const qrData = JSON.parse(decodedText);
          if (qrData.type === 'product') {
            const product = products.find(p => p._id === qrData.productId);
            if (product) {
              handleAddToCart(product);
              scanner.clear();
              setShowScanner(false);
            }
          }
        } catch (error) {
          console.error('Invalid QR code:', error);
        }
      }

      function onScanError(error) {
        // Silent error handling
      }
    }, 100);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Message */}
      {message && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Products</h1>
        
        {/* QR Scanner Button */}
        <button
          onClick={startScanner}
          className="btn-primary flex items-center gap-2 mb-6"
        >
          <QrCode className="w-5 h-5" />
          Scan Product QR
        </button>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 input-field"
            />
          </div>
          
          <div className="sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Scan Product QR Code</h2>
            <div id="qr-reader" className="mb-4"></div>
            <button
              onClick={() => setShowScanner(false)}
              className="btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      ) : (
        <>
          {/* Smart Recommendations */}
          <SmartRecommendations products={products} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ProductCard = ({ product, onAddToCart }) => {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ShoppingCart className="w-16 h-16 text-primary-400" />
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="mb-3">
          <div className="text-2xl font-bold text-gray-900">₹{product.price}</div>
          <div className="text-xs text-gray-500">+ {product.taxRate}% tax</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>

        {showQR && product.qrCode && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <img src={product.qrCode} alt="Product QR" className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
