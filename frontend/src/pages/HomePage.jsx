import { Link } from 'react-router-dom';
import { QrCode, ShoppingBag, RefreshCw, Shield, Zap, Smartphone } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Queue-less Shopping Experience
            </h1>
            <p className="text-xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Scan products, pay instantly, and walk out. No lines, no waiting.
              The future of retail is here.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/shop" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                Start Shopping
              </Link>
              <Link to="/exchange" className="bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-800 transition-colors border-2 border-white">
                Exchange Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<QrCode className="w-12 h-12" />}
              title="Scan Products"
              description="Each product has a unique QR code. Simply scan to add items to your cart."
            />
            <FeatureCard
              icon={<Smartphone className="w-12 h-12" />}
              title="Pay Instantly"
              description="Generate UPI payment QR and complete payment in seconds. Digital bill sent instantly."
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="Exit Verification"
              description="Show verification QR at exit. Staff validates and you're done!"
            />
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose Smart Retail?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard
              icon={<Zap className="w-10 h-10" />}
              title="Lightning Fast"
              description="Save time with instant checkout"
            />
            <BenefitCard
              icon={<ShoppingBag className="w-10 h-10" />}
              title="Easy Exchange"
              description="Hassle-free product exchange within 24 hours"
            />
            <BenefitCard
              icon={<QrCode className="w-10 h-10" />}
              title="Contactless"
              description="100% contactless shopping experience"
            />
            <BenefitCard
              icon={<Shield className="w-10 h-10" />}
              title="Secure"
              description="Safe and secure payment verification"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Shop Smarter?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Experience the future of retail today
          </p>
          <Link to="/shop" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="text-center p-6">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 text-primary-600 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
    <div className="text-primary-600 mb-3">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default HomePage;
