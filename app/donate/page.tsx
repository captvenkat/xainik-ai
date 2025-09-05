'use client';
import { useState } from 'react';

export default function Donate() {
  const [loading, setLoading] = useState(false);
  const [showUPI, setShowUPI] = useState(false);

  const donationTiers = [
    { amount: 1000, label: '₹1,000', description: 'Supports veteran training' },
    { amount: 2500, label: '₹2,500', description: 'Helps veteran placement' },
    { amount: 5000, label: '₹5,000', description: 'Major veteran impact' },
    { amount: 7500, label: '₹7,500', description: 'Transform veteran lives' },
    { amount: 10000, label: '₹10,000', description: 'Maximum veteran support' }
  ];

  async function handleDonation(amount: number) {
    setLoading(true);
    try {
      // Create Razorpay order
      const response = await fetch('/api/donations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) throw new Error('Order creation failed');

      const { orderId, keyId } = await response.json();

      // Initialize Razorpay
      const options = {
        key: keyId,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'Xainik',
        description: 'Unlocking Veterans',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/donations/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              alert('🎉 You helped unlock a veteran\'s future!');
              // Refresh page or show success state
            } else {
              throw new Error('Verification failed');
            }
          } catch (error) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#0A1F44'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Donation error:', error);
      setShowUPI(true); // Show UPI fallback
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A1F44] text-white p-6">
      <h1 className="text-2xl font-extrabold mb-2">Donate</h1>
      <p className="opacity-90 mb-4">🪖 5 lakh veterans need meaningful jobs. Your support helps.</p>
      
      {!showUPI ? (
        <div className="space-y-4 max-w-md">
          {donationTiers.map(({ amount, label, description }) => (
            <button
              key={amount}
              onClick={() => handleDonation(amount)}
              disabled={loading}
              className="w-full rounded-xl px-4 py-4 bg-white text-black font-semibold text-left hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold">{label}</div>
                  <div className="text-sm opacity-70">{description}</div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </button>
          ))}
          
          <button
            onClick={() => {/* TODO: Implement custom amount modal */}}
            className="w-full rounded-xl px-4 py-4 border border-white text-white hover:bg-white hover:text-black transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-bold">Custom Amount</div>
                <div className="text-sm opacity-70">Choose your own amount</div>
              </div>
              <div className="text-2xl">→</div>
            </div>
          </button>
          
          <button
            onClick={() => setShowUPI(true)}
            className="w-full rounded-xl px-4 py-3 border border-white text-white hover:bg-white hover:text-black transition-colors"
          >
            Having trouble? Use UPI
          </button>
        </div>
      ) : (
        <div className="max-w-md text-center">
          <div className="bg-white text-black rounded-xl p-6 mb-4">
            <div className="text-2xl font-bold mb-2">UPI Payment</div>
            <div className="text-lg mb-4">xainik@upi</div>
            <div className="text-sm opacity-70">Scan with any UPI app</div>
          </div>
          <button
            onClick={() => setShowUPI(false)}
            className="rounded-xl px-4 py-2 border border-white hover:bg-white hover:text-black transition-colors"
          >
            Back to Razorpay
          </button>
        </div>
      )}

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
    </main>
  );
}
