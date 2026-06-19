import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Landmark, QrCode, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import QRCodeGenerator from 'qrcode';
import api from '../../lib/api.js';
import canvasConfetti from 'canvas-confetti';

interface QRCodeData {
  _id: string;
  upiIdUsed: string;
  amount: number;
  customerName?: string;
  invoiceNumber?: string;
  description?: string;
  notes?: string;
  businessId: {
    _id: string;
    name: string;
    logo?: string;
    brandColor?: string;
    tagline?: string;
  };
}

export default function CheckoutView() {
  const { shortId } = useParams();
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Fetch QR Metadata on load
  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await api.get(`/qr/short/${shortId}`);
        const data = res.data.data;
        setQrData(data);

        // Standard UPI link
        const upiLink = `upi://pay?pa=${data.upiIdUsed}&pn=${encodeURIComponent(data.businessId.name)}&am=${data.amount}&tn=${encodeURIComponent(data.description || 'QRPay Pro Invoice')}&cu=INR`;
        
        const codeUrl = await QRCodeGenerator.toDataURL(upiLink, {
          width: 300,
          margin: 1,
          color: {
            dark: data.businessId.brandColor || '#000000',
            light: '#FFFFFF'
          }
        });
        setQrUrl(codeUrl);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Failed to fetch payment details.');
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, [shortId]);

  // Load Razorpay checkout script
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!qrData) return;
    setPayLoading(true);

    try {
      // 1. Create order on backend
      const orderRes = await api.post('/payments/create-order', {
        qrCodeId: qrData._id,
        customerName: qrData.customerName,
      });

      const { orderId, amount, keyId, paymentId, businessName, brandColor } = orderRes.data.data;

      // Check if running in mock mode
      if (keyId === 'mock_razorpay_key_id') {
        // Trigger mock verification directly
        const verifyRes = await api.post('/payments/verify', {
          razorpay_order_id: orderId,
          razorpay_payment_id: `mock_pay_${Math.random().toString(36).substring(2, 10)}`,
          paymentId,
        });

        setPaymentSuccess(true);
        setPaymentDetails(verifyRes.data.data);
        canvasConfetti({ particleCount: 150, spread: 80 });
        return;
      }

      // 2. Load SDK & Launch Razorpay modal
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert('Razorpay SDK failed to load. Are you offline?');
        return;
      }

      const options = {
        key: keyId,
        amount: amount * 100,
        currency: 'INR',
        name: businessName,
        description: qrData.description || 'Payment Invoice',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
            });

            setPaymentSuccess(true);
            setPaymentDetails(verifyRes.data.data);
            canvasConfetti({ particleCount: 150, spread: 80 });
          } catch (err: any) {
            alert('Payment signature verification failed. Please contact support.');
          }
        },
        theme: {
          color: brandColor || '#7c3aed',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment initiation failed.');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        <span className="text-sm text-slate-400 mt-4">Loading secure billing portal...</span>
      </div>
    );
  }

  if (errorMsg || !qrData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Invoice Not Found</h2>
        <p className="text-slate-400 text-sm max-w-xs text-center mb-6">{errorMsg || 'This payment link is invalid or has expired.'}</p>
      </div>
    );
  }

  const brandColor = qrData.businessId.brandColor || '#7c3aed';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Brand Banner */}
        <div className="h-2" style={{ backgroundColor: brandColor }}></div>

        {paymentSuccess ? (
          /* Payment Success State */
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-slate-400 text-sm mb-6">Your transaction has been securely captured.</p>

            <div className="w-full bg-slate-950 border border-slate-800 p-6 rounded-2xl text-left space-y-4 text-xs font-medium mb-8">
              <div className="flex justify-between text-slate-500">
                <span>Merchant</span>
                <span className="text-slate-300 font-semibold">{qrData.businessId.name}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Amount Paid</span>
                <span className="text-green-400 font-bold text-sm">₹{qrData.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Transaction Ref ID</span>
                <span className="text-slate-300 font-mono">{paymentDetails?.gatewayPaymentId || 'N/A'}</span>
              </div>
            </div>

            <span className="text-xs text-slate-500">You can safely close this browser window.</span>
          </div>
        ) : (
          /* Main Billing State */
          <div className="p-8">
            {/* Header info */}
            <div className="flex flex-col items-center justify-center text-center mb-8">
              {qrData.businessId.logo ? (
                <img src={qrData.businessId.logo} alt="Business logo" className="w-16 h-16 rounded-2xl mb-4 object-cover" />
              ) : (
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                  <Landmark className="h-7 w-7 text-slate-400" />
                </div>
              )}
              <h1 className="text-xl font-bold text-white">{qrData.businessId.name}</h1>
              {qrData.businessId.tagline && (
                <p className="text-xs text-slate-500 mt-1">{qrData.businessId.tagline}</p>
              )}
            </div>

            {/* Bill Amount Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center mb-8 relative overflow-hidden">
              <div className="absolute -right-2 -bottom-2 opacity-5 pointer-events-none">
                <QrCode className="h-24 w-24 text-slate-100" />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Billing Amount</span>
              <span className="text-3xl font-extrabold text-white">₹{qrData.amount.toFixed(2)}</span>
              {qrData.customerName && (
                <div className="border-t border-slate-800/80 mt-4 pt-3 flex justify-between text-xs text-slate-400">
                  <span>Payee</span>
                  <span className="text-slate-300 font-semibold">{qrData.customerName}</span>
                </div>
              )}
              {qrData.invoiceNumber && (
                <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                  <span>Invoice #</span>
                  <span className="text-slate-300 font-mono">{qrData.invoiceNumber}</span>
                </div>
              )}
            </div>

            {/* QR Scan Section */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="bg-white p-5 rounded-2xl mb-4 shadow-lg shadow-black/40">
                {qrUrl ? (
                  <img src={qrUrl} alt="UPI Payment QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-slate-800" />
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-500">Scan QR code using GooglePay, PhonePe, Paytm, or BHIM app</span>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={payLoading}
              className="w-full py-4 text-sm font-bold text-white rounded-xl transition flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
              style={{
                backgroundColor: brandColor,
                boxShadow: `0 4px 14px 0 ${brandColor}40`
              }}
            >
              {payLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Pay Securely via Gateway</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
