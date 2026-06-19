import { useState, useEffect } from 'react';
import { Calculator, Plus, Trash2, QrCode, X, Share2, Download, Landmark, Loader2, Check, Printer } from 'lucide-react';
import QRCodeGenerator from 'qrcode';
import api from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function SmartCalculatorSubView() {
  const { business, user } = useAuthStore();
  const upiId = business?.upiIds?.[0] || 'merchant@upi';

  // Calculator basic math state
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('0');

  // Smart Cart billing list state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [taxRate, setTaxRate] = useState(0); // GST % option (0, 5, 12, 18)

  // QR Modal popup state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Render QR canvas in calculator modal with logo support
  useEffect(() => {
    if (qrModalOpen && !qrLoading && paymentUrl) {
      setTimeout(() => {
        const canvas = document.getElementById('calc-qr-canvas') as HTMLCanvasElement;
        if (!canvas) return;

        QRCodeGenerator.toCanvas(canvas, paymentUrl, {
          width: 250,
          margin: 1,
          color: {
            dark: business?.brandColor || '#7c3aed',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        }, (err) => {
          if (err) {
            console.error(err);
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Draw custom logo overlay if business logo is present
          if (business?.logo) {
            const img = new Image();
            img.src = business.logo;
            img.crossOrigin = 'anonymous';
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

              // Update download url
              setQrDataUrl(canvas.toDataURL('image/png'));
            };
          } else {
            // Update download url
            setQrDataUrl(canvas.toDataURL('image/png'));
          }
        });
      }, 100);
    }
  }, [qrModalOpen, qrLoading, paymentUrl, business?.logo, business?.brandColor]);

  // Simple math calculator functions
  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
      setCalcResult('0');
    } else if (val === '⌫') {
      setCalcInput((prev) => prev.slice(0, -1));
    } else if (val === '=') {
      try {
        // Safe evaluation of basic math expressions using Function constructor
        const sanitized = calcInput.replace(/x/g, '*').replace(/[^0-9+\-*/.()]/g, '');
        const evalResult = new Function(`return ${sanitized}`)();
        setCalcResult(String(Number(evalResult).toFixed(2)));
      } catch (err) {
        setCalcResult('Error');
      }
    } else {
      setCalcInput((prev) => prev + val);
    }
  };

  // Add calculator result directly to Cart Compiler
  const addCalcToCart = () => {
    if (calcResult === '0' || calcResult === 'Error') return;

    // Check if the calculation input has addition components to break down
    // e.g. "80+20+30" or "50x2 + 30"
    const inputWithAdditions = calcInput.includes('+');

    if (inputWithAdditions) {
      // Split the expression by '+'
      const parts = calcInput.split('+');
      const newItems: CartItem[] = [];
      let itemIndexStart = cartItems.length + 1;

      parts.forEach((part) => {
        const trimmed = part.trim();
        if (!trimmed) return;
        try {
          const sanitizedPart = trimmed.replace(/x/g, '*').replace(/[^0-9+\-*/.()]/g, '');
          if (!sanitizedPart) return;
          const evaluated = new Function(`return ${sanitizedPart}`)();
          const price = parseFloat(Number(evaluated).toFixed(2));
          if (isNaN(price) || price <= 0) return;

          newItems.push({
            id: Math.random().toString(36).substr(2, 9),
            name: `Item ${itemIndexStart++}`,
            price: price,
            quantity: 1,
          });
        } catch (e) {
          console.error(e);
        }
      });

      if (newItems.length > 0) {
        setCartItems((prev) => [...prev, ...newItems]);
        setCalcInput('');
        setCalcResult('0');
      }
    } else {
      // Single calculation item (e.g. "50 x 2" or simple number)
      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: calcInput ? `Calc: ${calcInput}` : `Calculation Result`,
        price: parseFloat(calcResult),
        quantity: 1,
      };
      setCartItems((prev) => [...prev, newItem]);
      setCalcInput('');
      setCalcResult('0');
    }
  };

  // Cart Functions
  const removeCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Print Invoice layout generation and printer triggering
  const printInvoice = () => {
    if (cartItems.length === 0) return;

    // Open a new printable window
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to print the invoice.');
      return;
    }

    const businessName = business?.name || 'My Business';
    const ownerName = user?.ownerName || '';
    const mobile = user?.mobile || '';
    const dateStr = new Date().toLocaleString();
    const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;

    // Build the items HTML list
    const itemsHtml = cartItems.map((item, idx) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">${item.name}</td>
        <td style="padding: 8px 0; border-bottom: 1px dashed #e2e8f0; text-align: right;">₹${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    // Construct print UPI link
    const upiLink = paymentUrl || `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${grandTotal.toFixed(2)}&cu=INR`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceNum}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: 'Courier New', Courier, monospace; color: #000; font-size: 14px; }
              .no-print { display: none; }
            }
            body { font-family: 'Courier New', Courier, monospace; padding: 40px; max-width: 400px; margin: 0 auto; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 15px; }
            .business-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .total-section { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; border-top: 2px dashed #000; padding-top: 15px; font-size: 11px; }
            .qr-container { text-align: center; margin: 20px 0; display: flex; flex-direction: column; align-items: center; }
            .btn-print { background: #7c3aed; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: block; margin: 20px auto 0 auto; font-family: sans-serif; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-name">${businessName}</div>
            ${ownerName ? `<div>Owner: ${ownerName}</div>` : ''}
            ${mobile ? `<div>Mobile: +91 ${mobile}</div>` : ''}
          </div>

          <table style="width:100%; font-size:12px; margin-bottom:15px;">
            <tr><td>Date: ${dateStr}</td><td style="text-align:right;">Inv: ${invoiceNum}</td></tr>
          </table>

          <table class="items-table">
            <thead>
              <tr style="border-bottom: 1px dashed #000; text-align: left; font-size:12px; color:#666;">
                <th style="padding-bottom: 5px;">Item Description</th>
                <th style="padding-bottom: 5px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-section">
            <table style="width:100%;">
              <tr><td>Subtotal:</td><td style="text-align:right;">₹${subtotal.toFixed(2)}</td></tr>
              ${taxRate > 0 ? `<tr><td>Tax (${taxRate}%):</td><td style="text-align:right;">₹${taxAmount.toFixed(2)}</td></tr>` : ''}
              <tr style="font-size: 16px; border-top: 1px dashed #000; height: 35px;">
                <td>Grand Total:</td>
                <td style="text-align:right;">₹${grandTotal.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="qr-container">
            <div style="font-size:11px; font-weight:bold; margin-bottom:10px;">SCAN TO PAY VIA UPI</div>
            <div id="print-qr"></div>
          </div>

          <div class="footer">
            <div>Thank you for your business!</div>
            <div>Powered by QRPay Pro</div>
          </div>

          <button class="btn-print no-print" onclick="window.print()">Print Receipt</button>

          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            new QRCode(document.getElementById("print-qr"), {
              text: "${upiLink.replace(/"/g, '\\"')}",
              width: 140,
              height: 140,
              colorDark : "#000000",
              colorLight : "#ffffff",
              correctLevel : QRCode.CorrectLevel.H
            });
            setTimeout(() => {
              window.print();
            }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  // Generate QR Code from the billing total
  const generateCartQR = async (amountToCharge: number) => {
    if (amountToCharge <= 0) return;
    setQrAmount(amountToCharge);
    setQrLoading(true);
    setQrModalOpen(true);
    try {
      // Register QR with backend to track payment webhook status
      const response = await api.post('/qr/generate', {
        amount: amountToCharge,
        upiIdUsed: upiId,
        description: `Cart payment of ₹${amountToCharge}`,
      });

      const qrCodeData = response.data.data.qrCode;
      const checkoutUrl = response.data.data.paymentUrl;
      setPaymentUrl(checkoutUrl);

      // Generate visual QR code
      const codeUrl = await QRCodeGenerator.toDataURL(checkoutUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrDataUrl(codeUrl);
    } catch (err) {
      console.error(err);
      // Fallback direct UPI link generation if backend has any network issue
      const directUpi = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(business?.name || 'Merchant')}&am=${amountToCharge}&cu=INR`;
      setPaymentUrl(directUpi);
      const codeUrl = await QRCodeGenerator.toDataURL(directUpi, { width: 300 });
      setQrDataUrl(codeUrl);
    } finally {
      setQrLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Smart Business Calculator</h2>
        <p className="text-xs text-slate-400 mt-1">Perform quick math calculations or compile product billing totals to generate instant checkout QR codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Math Calculator (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-purple-400" />
              <span>Standard Calculator</span>
            </h3>
            {/* Calculator Display */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 text-right">
              <div className="text-lg text-slate-400 font-mono font-semibold h-8 truncate mb-1">{calcInput || '0'}</div>
              <div className="text-3xl font-extrabold text-white font-mono truncate">₹{calcResult}</div>
            </div>
            
            {/* Keys Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {['C', '(', ')', '⌫'].map(k => (
                <button key={k} onClick={() => handleCalcClick(k)} className="py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold font-mono rounded-lg transition text-sm cursor-pointer">{k}</button>
              ))}
              {['7', '8', '9', '/'].map(k => (
                <button key={k} onClick={() => handleCalcClick(k)} className="py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold font-mono rounded-lg transition text-sm cursor-pointer">{k}</button>
              ))}
              {['4', '5', '6', 'x'].map(k => (
                <button key={k} onClick={() => handleCalcClick(k)} className="py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold font-mono rounded-lg transition text-sm cursor-pointer">{k}</button>
              ))}
              {['1', '2', '3', '-'].map(k => (
                <button key={k} onClick={() => handleCalcClick(k)} className="py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold font-mono rounded-lg transition text-sm cursor-pointer">{k}</button>
              ))}
              {['0', '00', '.', '+'].map(k => (
                <button key={k} onClick={() => handleCalcClick(k)} className="py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold font-mono rounded-lg transition text-sm cursor-pointer">{k}</button>
              ))}
              <button onClick={() => handleCalcClick('=')} className="py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold font-mono rounded-lg transition text-sm cursor-pointer col-span-4">=</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={addCalcToCart}
              disabled={calcResult === '0' || calcResult === 'Error'}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={() => generateCartQR(parseFloat(calcResult))}
              disabled={calcResult === '0' || calcResult === 'Error'}
              className="py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-purple-500/10"
            >
              <QrCode className="h-4 w-4" />
              <span>Create QR</span>
            </button>
          </div>
        </div>

        {/* Right Side: Smart Cart compiler (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4">Cart Compiler (Billing List)</h3>

            {/* Cart Items list */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto mb-6 bg-slate-950/40">
              <table className="w-full text-left text-xs text-slate-400">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 font-semibold">
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/10">
                        <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-200">₹{item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeCartItem(item.id)}
                            className="text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        Billing list is empty. Add calculation results on the left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cart totals and checkout */}
          <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500 text-xs">Subtotal:</span>
                <div className="font-bold text-white font-mono">₹{subtotal.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">GST/Tax:</span>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="block bg-slate-950 border border-slate-850 rounded-lg text-[10px] py-1 px-2 text-slate-300 focus:outline-none"
                >
                  <option value={0}>0% GST</option>
                  <option value={5}>5% GST</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST</option>
                </select>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Grand Total:</span>
                <div className="text-xl font-extrabold text-purple-400 font-mono">₹{grandTotal.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex space-x-3 w-full md:w-auto">
              <button
                onClick={printInvoice}
                disabled={cartItems.length === 0}
                className="flex-1 md:flex-initial px-6 py-3.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Printer className="h-4 w-4 text-purple-400" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => generateCartQR(grandTotal)}
                disabled={grandTotal <= 0}
                className="flex-1 md:flex-initial px-6 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-purple-500/25"
              >
                <QrCode className="h-4 w-4" />
                <span>Create QR</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* QR Output Modal Popup */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Corner Close Button */}
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950 p-1.5 rounded-full border border-slate-800/80 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">Cart Billing QR</h3>
              <p className="text-xs text-slate-500 mb-6">Scan the UPI QR code below to complete payment.</p>

              {qrLoading ? (
                <div className="h-56 w-56 mx-auto bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center justify-center mb-6">
                  <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                  <span className="text-[10px] text-slate-500 mt-2">Generating secure code...</span>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl max-w-[220px] mx-auto shadow-lg mb-6 flex justify-center items-center">
                  <canvas id="calc-qr-canvas" className="w-full h-full max-w-[188px] max-h-[188px] rounded-xl"></canvas>
                </div>
              )}

              <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-950/40 border border-purple-900/50 rounded-full text-xs text-purple-300 font-bold mb-6">
                <Landmark className="h-3.5 w-3.5" />
                <span>Amount: ₹{qrAmount.toFixed(2)}</span>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={copyLink}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrDataUrl;
                    link.download = `billing_qr_${qrAmount}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
