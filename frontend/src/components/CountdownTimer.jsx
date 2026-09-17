import { useState, useEffect } from 'react';

export default function CountdownTimer({ expiryTime }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiryTime) - new Date();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('EXPIRED');
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold ${
      isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
    }`}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        {isExpired ? 'QR Expired' : `Valid for: ${timeLeft}`}
      </span>
    </div>
  );
}
