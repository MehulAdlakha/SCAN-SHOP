import { Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Mock recommendation logic based on cart items
const getRecommendations = (cartItems, allProducts) => {
  if (!cartItems || cartItems.length === 0) return [];

  // Category-based recommendations
  const cartCategories = cartItems.map(item => item.category);
  const mostCommonCategory = cartCategories.sort((a, b) =>
    cartCategories.filter(c => c === a).length - cartCategories.filter(c => c === b).length
  ).pop();

  // Get products from same category not in cart
  const categoryRecommendations = allProducts.filter(
    product => product.category === mostCommonCategory && 
    !cartItems.some(item => item.productId === product._id)
  ).slice(0, 3);

  // Price-based recommendations (similar price range)
  const avgCartPrice = cartItems.reduce((sum, item) => sum + item.priceWithTax, 0) / cartItems.length;
  const priceRecommendations = allProducts.filter(
    product => {
      const priceDiff = Math.abs(product.priceWithTax - avgCartPrice);
      return priceDiff < avgCartPrice * 0.3 && !cartItems.some(item => item.productId === product._id);
    }
  ).slice(0, 2);

  // Combine and deduplicate
  const recommendations = [...categoryRecommendations, ...priceRecommendations];
  const uniqueRecommendations = recommendations.filter((product, index, self) =>
    index === self.findIndex(p => p._id === product._id)
  );

  return uniqueRecommendations.slice(0, 4);
};

// Frequently bought together mock data
const frequentlyBoughtTogether = {
  'Milk': ['Bread', 'Butter', 'Eggs'],
  'Bread': ['Butter', 'Jam', 'Cheese'],
  'Rice': ['Lentils', 'Oil', 'Spices'],
  'Coffee': ['Sugar', 'Milk', 'Biscuits'],
  'Tea': ['Sugar', 'Milk', 'Biscuits']
};

export default function SmartRecommendations({ products }) {
  const { cart, addToCart } = useApp();

  const recommendations = getRecommendations(cart.items, products);

  // Get frequently bought together items
  const frequentlyBought = [];
  if (cart.items.length > 0) {
    cart.items.forEach(item => {
      const itemName = item.name;
      const relatedNames = frequentlyBoughtTogether[itemName] || [];
      relatedNames.forEach(name => {
        const product = products.find(p => p.name === name);
        if (product && !cart.items.some(i => i.productId === product._id)) {
          if (!frequentlyBought.find(p => p._id === product._id)) {
            frequentlyBought.push({ ...product, basedOn: itemName });
          }
        }
      });
    });
  }

  if (recommendations.length === 0 && frequentlyBought.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-md p-6 border-2 border-purple-200">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Frequently Bought Together</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {frequentlyBought.slice(0, 4).map((product) => (
              <div key={product._id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                <div className="mb-2">
                  <span className="text-xs text-purple-600 font-semibold">
                    ✨ Goes with {product.basedOn}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    ₹{product.priceWithTax.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* You Might Also Like */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-md p-6 border-2 border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">You Might Also Like</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((product) => (
              <div key={product._id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                <div className="mb-2">
                  <span className="text-xs text-blue-600 font-semibold">
                    Recommended for you
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    ₹{product.priceWithTax.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
