import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore.js';
import { Landmark, QrCode, Download, Share2, Copy, Sparkles, Loader2, Link2, Check } from 'lucide-react';
import QRCodeGenerator from 'qrcode';
import api from '../../lib/api.js';

const qrFormSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  upiIdUsed: z.string().min(1, 'UPI ID is required'),
  customerName: z.string().optional(),
  invoiceNumber: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type QRFormFields = z.infer<typeof qrFormSchema>;

export default function QRGeneratorSubView() {
  const { business } = useAuthStore();
  const [createdQR, setCreatedQR] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const handleMarkAsPaid = async () => {
    if (!createdQR) return;
    setIsLoading(true);
    setIsMarkingPaid(true);
    try {
      // 1. Create a pending payment order for this QR code
      const orderRes = await api.post('/payments/create-order', {
        qrCodeId: createdQR._id,
        customerName: createdQR.customerName,
      });

      const { paymentId, orderId } = orderRes.data.data;

      // 2. Verify the payment to record it as successful in transactions
      await api.post('/payments/verify', {
        paymentId,
        razorpay_order_id: orderId,
        razorpay_payment_id: `manual_rec_${Math.random().toString(36).substr(2, 9)}`,
      });

      alert('Payment recorded successfully as paid!');
      setCreatedQR(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record manual payment.');
    } finally {
      setIsLoading(false);
      setIsMarkingPaid(false);
    }
  };

  // Fetch registered customers list
  const { data: customers } = useQuery({
    queryKey: ['customersList'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    },
  });

  // Customization states
  const [qrColor, setQrColor] = useState(business?.brandColor || '#7c3aed');
  const [qrTemplate, setQrTemplate] = useState('classic'); // 'classic' | 'rounded' | 'framed'
  const [taglineText, setTaglineText] = useState(business?.tagline || 'Scan & Pay');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<QRFormFields>({
    resolver: zodResolver(qrFormSchema),
    defaultValues: {
      upiIdUsed: business?.upiIds?.[0] || '',
    },
  });

  // Re-render canvas whenever customization or link changes
  useEffect(() => {
    if (!createdQR || !canvasRef.current) return;

    // Use direct UPI URL for scanning
    const upiId = createdQR.upiIdUsed || business?.upiIds?.[0] || 'merchant@upi';
    const amountVal = createdQR.amount || 0;
    const businessName = business?.name || 'Merchant';
    const textToEncode = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amountVal}&cu=INR`;

    const qrOptions: any = {
      width: 250,
      margin: 1,
      color: {
        dark: qrColor,
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction to support logo overlay
    };

    QRCodeGenerator.toCanvas(canvasRef.current, textToEncode, qrOptions, (err) => {
      if (err) {
        console.error(err);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw custom logo overlay if business logo is present
      if (business?.logo) {
        const img = new Image();
        img.src = business.logo;
        img.crossOrigin = 'anonymous'; // support CDNs
        img.onload = () => {
          const logoSize = canvas.width * 0.22;
          const pos = (canvas.width - logoSize) / 2;
          
          // Outer logo shield container
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, (logoSize + 6) / 2, 0, 2 * Math.PI);
          ctx.fill();

          // Logo image clip
          ctx.save();
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(img, pos, pos, logoSize, logoSize);
          ctx.restore();
        };
      }
    });
  }, [createdQR, qrColor, qrTemplate, taglineText, paymentUrl, business?.logo]);

  const onSubmit = async (data: QRFormFields) => {
    setIsLoading(true);
    try {
      const res = await api.post('/qr', data);
      setCreatedQR(res.data.data.qrCode);
      setPaymentUrl(res.data.data.paymentUrl);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate QR Code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrpay-${createdQR?.invoiceNumber || 'billing'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleShare = () => {
    if (!paymentUrl) return;
    const text = encodeURIComponent(`Please pay ₹${createdQR?.amount} to ${business?.name}. Pay securely here: ${paymentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`);
  };

  const handleCopyLink = () => {
    if (!paymentUrl) return;
    navigator.clipboard.writeText(paymentUrl);
    alert('Payment checkout URL link copied to clipboard!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form configuration panel */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <QrCode className="h-6 w-6 text-purple-500" />
          <span>Configure QR Payment link</span>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Billing Amount (INR)</label>
              <input
                type="number"
                step="0.01"
                {...register('amount')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 px-4 text-white text-sm"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1.5">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">UPI ID VPA</label>
              <select
                {...register('upiIdUsed')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 px-4 text-white text-sm"
              >
                {business?.upiIds.map((upi) => (
                  <option key={upi} value={upi}>{upi}</option>
                ))}
              </select>
              {errors.upiIdUsed && (
                <p className="text-red-500 text-xs mt-1.5">{errors.upiIdUsed.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customer Name (Optional)</label>
              <input
                type="text"
                list="customers-datalist"
                {...register('customerName')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 px-4 text-white text-sm"
                placeholder="Select or type customer name"
              />
              <datalist id="customers-datalist">
                {customers && customers.map((c: any) => (
                  <option key={c._id} value={c.name}>
                    {c.mobile ? `${c.name} (${c.mobile})` : c.name}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Invoice Number (Optional)</label>
              <input
                type="text"
                {...register('invoiceNumber')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 px-4 text-white text-sm"
                placeholder="INV-2026-001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Billing Description (Optional)</label>
              <textarea
                rows={2}
                {...register('description')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 px-4 text-white text-sm resize-none"
                placeholder="Describe this invoice..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Billing QR Link</span>
              </>
            )}
          </button>
        </form>

        {/* QR Customizer Tools */}
        {createdQR && (
          <div className="mt-8 border-t border-slate-800/80 pt-6">
            <h3 className="text-sm font-bold text-white mb-4">Customizer Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">QR Block Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="h-10 w-12 bg-transparent border border-slate-800 rounded-lg cursor-pointer p-0.5"
                  />
                  <span className="text-xs text-slate-500 font-mono">{qrColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tagline Frame</label>
                <input
                  type="text"
                  value={taglineText}
                  onChange={(e) => setTaglineText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2 px-3.5 text-white text-xs"
                  placeholder="Scan & Pay"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time preview card */}
      <div className="flex flex-col items-center justify-start">
        {createdQR ? (
          <div className="w-full bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-xl flex flex-col items-center">
            
            {/* The customized Frame container */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col items-center w-full mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{business?.name}</span>
              <canvas ref={canvasRef} className="rounded-xl shadow-lg border border-slate-900"></canvas>
              <div className="mt-4 flex items-center space-x-1.5">
                <Landmark className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{taglineText}</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={handleMarkAsPaid}
                disabled={isLoading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-green-500/10"
              >
                {isMarkingPaid ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Done (Mark as Paid)</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition border border-slate-700 cursor-pointer"
              >
                <Download className="h-4 w-4 text-purple-400" />
                <span>Download QR Code (PNG)</span>
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShare}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition border border-slate-700 cursor-pointer"
                >
                  <Share2 className="h-4 w-4 text-blue-400" />
                  <span>Share QR</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition border border-slate-700 cursor-pointer"
                >
                  <Link2 className="h-4 w-4 text-green-400" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="w-full bg-slate-900/30 border border-slate-800/50 border-dashed p-12 rounded-3xl flex flex-col items-center justify-center text-center h-[340px]">
            <QrCode className="h-12 w-12 text-slate-700 mb-4 animate-pulse" />
            <span className="text-xs text-slate-500 font-semibold max-w-xs">Complete the billing fields on the left to generate your custom payment link QR code.</span>
          </div>
        )}
      </div>
    </div>
  );
}
