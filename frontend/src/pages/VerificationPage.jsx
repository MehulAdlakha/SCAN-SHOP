import { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verificationAPI } from '../services/api';
import { QrCode, CheckCircle, XCircle, AlertCircle, AlertTriangle } from 'lucide-react';

const VerificationPage = () => {
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');

  const startScanner = () => {
    setShowScanner(true);
    setVerificationResult(null);
    setError('');

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('verification-qr-reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
      });

      scanner.render(onScanSuccess, onScanError);

      async function onScanSuccess(decodedText) {
        try {
          const qrData = JSON.parse(decodedText);
          let orderNumber = '';

          if (qrData.type === 'verification') {
            orderNumber = qrData.orderNumber;
          } else {
            orderNumber = decodedText;
          }

          scanner.clear();
          setShowScanner(false);
          await verifyOrder(orderNumber);
        } catch (error) {
          // Try as plain order number
          scanner.clear();
          setShowScanner(false);
          await verifyOrder(decodedText);
        }
      }

      function onScanError(error) {
        // Silent
      }
    }, 100);
  };

  const verifyOrder = async (orderNumber) => {
    setLoading(true);
    setError('');

    try {
      const response = await verificationAPI.verify(orderNumber);
      setVerificationResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setVerificationResult({ verified: false, message: 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Exit Verification</h1>

      {/* Scanner Button */}
      {!verificationResult && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <QrCode className="w-20 h-20 text-primary-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Scan Customer's Verification QR
          </h2>
          <p className="text-gray-600 mb-6">
            Ask the customer to show their verification QR code from the order confirmation
          </p>

          <button
            onClick={startScanner}
            className="btn-primary inline-flex items-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Start Scanner
          </button>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Scan Verification QR Code</h2>
            <div id="verification-qr-reader" className="mb-4"></div>
            <button
              onClick={() => setShowScanner(false)}
              className="btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying...</p>
        </div>
      )}

      {/* Verification Result */}
      {!loading && verificationResult && (
        <div className={`rounded-xl shadow-lg p-8 ${
          verificationResult.verified ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
        }`}>
          {/* Fraud Warning Banner */}
          {verificationResult.fraudWarning && (
            <div className="bg-red-600 text-white px-4 py-3 rounded-lg mb-6 flex items-start space-x-3 animate-pulse">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-lg">⚠️ FRAUD ALERT</p>
                <p className="text-sm">{verificationResult.fraudWarning}</p>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            {verificationResult.verified ? (
              <>
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-green-900 mb-2">
                  {verificationResult.alreadyVerified ? 'Already Verified' : 'Verified Successfully'}
                </h2>
                <p className="text-green-700">
                  {verificationResult.alreadyVerified 
                    ? 'This order was already verified earlier' 
                    : 'Customer can proceed with exit'}
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-red-900 mb-2">❌ Not Verified</h2>
                <p className="text-red-700">{verificationResult.message}</p>
              </>
            )}
          </div>

          {/* Order Details */}
          {verificationResult.data && verificationResult.data.order && (
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Order Details</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{verificationResult.data.order.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold">₹{verificationResult.data.order.totalAmount?.toFixed(2)}</p>
                </div>
                {verificationResult.data.order.verifiedAt && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Verified At</p>
                      <p className="font-semibold">
                        {new Date(verificationResult.data.order.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Verified By</p>
                      <p className="font-semibold">{verificationResult.data.order.verifiedBy}</p>
                    </div>
                  </>
                )}
              </div>

              {verificationResult.data.order.items && (
                <div>
                  <h4 className="font-semibold mb-2">Items Purchased</h4>
                  <div className="space-y-2">
                    {verificationResult.data.order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span>{item.productName} × {item.quantity}</span>
                        <span>₹{item.totalAmount?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => {
              setVerificationResult(null);
              setError('');
            }}
            className="btn-primary w-full"
          >
            Scan Another QR
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && !verificationResult && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
