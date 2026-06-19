import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, ShieldCheck, ArrowRight, Activity, Users, CheckCircle, HelpCircle, Sparkles, Smartphone, Download, Share2 } from 'lucide-react';
import QRCodeGenerator from 'qrcode';

export default function LandingView() {
  const navigate = useNavigate();
  const [demoAmount, setDemoAmount] = useState('100');
  const [demoName, setDemoName] = useState('John Doe');
  const [demoQrUrl, setDemoQrUrl] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    // Generate an interactive demo QR link pointing to a mock pay URL on load
    const upiLink = `upi://pay?pa=merchant@bank&pn=QRPayPro%20Demo&am=${demoAmount}&tn=Invoice%20Demo&cu=INR`;
    QRCodeGenerator.toDataURL(upiLink, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then(url => setDemoQrUrl(url))
      .catch(err => console.error(err));
  }, [demoAmount]);

  const faqs = [
    {
      q: 'What is QRPay Pro and how does it work?',
      a: 'QRPay Pro is a smart merchant payment platform that lets you generate branded UPI QR codes, accept payments instantly, and manage all your transactions from a single dashboard. Simply register, add your UPI VPA, customize your QR code, and start accepting payments — no hardware required.'
    },
    {
      q: 'How do I generate my UPI QR code?',
      a: 'After logging in to your merchant dashboard, navigate to the QR Generator section. Enter the amount (or leave it dynamic), select your registered UPI VPA, customize your branding, and download your QR code instantly. You can also embed your business logo directly on the QR.'
    },
    {
      q: 'Is QRPay Pro safe and secure for my business?',
      a: 'Absolutely. QRPay Pro uses industry-standard 256-bit SSL encryption for all transactions. Your UPI credentials are never stored on our servers — we only securely link your VPA for QR generation. All data is protected and fully compliant with RBI guidelines for payment aggregators.'
    },
    {
      q: 'How quickly will I receive my payments?',
      a: 'Payments accepted through QRPay Pro QR codes are settled directly to your registered bank account via the UPI network, typically within seconds to a few minutes. For any settlement delays, you can reach out to our priority settlement desk at settlements@qrpaypro.com.'
    },
    {
      q: 'Can I track all my transactions and export reports?',
      a: 'Yes! Your merchant dashboard provides a complete transaction history with filters by date, amount, and status. You can view analytics including total collections and payment trends, and export detailed PDF reports for accounting and reconciliation purposes.'
    },
    {
      q: 'What should I do if a customer pays but the transaction shows as pending?',
      a: 'Pending transactions are usually resolved within a few minutes via UPI auto-reconciliation. If the status does not update, please contact our support team with the Transaction ID and customer UPI reference. Our team responds within 15 minutes for priority VPAs.'
    },
    {
      q: 'How do I contact QRPay Pro support?',
      a: 'You can reach our merchant support team through the Contact Support page on our website. Our support specialists are available to assist with API configuration, QR generation issues, branding settings, and gateway settlements. You can also submit a help ticket directly from the dashboard.'
    },
    {
      q: 'Is there a free plan available?',
      a: 'Yes, QRPay Pro offers a Starter plan at no cost, which includes basic QR code generation, one UPI VPA, and standard branding. You can upgrade to the Business plan for advanced analytics, PDF exports, custom branding with logo overlays, and priority support.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-600 selection:text-white">
      {/* Header / Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              QRPay <span className="text-purple-500">Pro</span>
            </span>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#demo" className="hover:text-white transition">Live Demo</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faqs" className="hover:text-white transition">FAQs</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              to="/register"
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 text-white hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-800"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-slate-950 rounded-md group-hover:bg-opacity-0">
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Backdrop Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-950/40 border border-purple-800/30 rounded-full px-3.5 py-1.5 text-xs text-purple-300 mb-8 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Secure Webhook-Integrated QR SaaS Platform</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-transparent max-w-4xl mx-auto leading-none mb-6">
            Accept UPI Payments Securely via Dynamic QR Codes
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Generate custom QR codes, send digital invoices, track success statuses in real-time, and run detailed analytics — all backed by official gateway webhooks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/20"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold rounded-xl transition flex items-center justify-center space-x-2"
            >
              <span>Try Live Demo</span>
            </a>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Experience it Live</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Generate a custom UPI QR code instantly. Enter payment variables below and preview the generated code.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo Form */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md shadow-xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Smartphone className="text-purple-500 h-5 w-5" />
                <span>Configure QR Code Variables</span>
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Billing Amount (INR)</label>
                  <input
                    type="number"
                    value={demoAmount}
                    onChange={(e) => setDemoAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    placeholder="Customer Name"
                  />
                </div>
                <div className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-xl">
                  <p className="text-xs text-purple-300 leading-relaxed">
                    💡 <strong>How Checkout Works:</strong> In production, scanning this QR redirects customers to our secure platform page. They complete payment via Razorpay, and webhooks instantly update your dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* QR Result */}
            <div className="flex flex-col items-center justify-center p-8 bg-slate-900/30 border border-slate-800/50 rounded-3xl">
              <div className="bg-white p-6 rounded-2xl shadow-xl shadow-purple-500/5 mb-6">
                {demoQrUrl ? (
                  <img src={demoQrUrl} alt="Demo QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-slate-950 rounded-xl flex items-center justify-center">
                    <QrCode className="h-10 w-10 text-slate-800 animate-pulse" />
                  </div>
                )}
              </div>
              <span className="text-sm font-semibold bg-purple-950 text-purple-300 px-3 py-1 rounded-full border border-purple-900 mb-6">
                Payee: {demoName} • Amount: ₹{demoAmount}
              </span>
              <div className="flex space-x-3 w-full max-w-xs">
                <button
                  onClick={() => window.open(demoQrUrl)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`Pay ₹${demoAmount} to merchant`);
                    alert('Mock payment URL copied to clipboard!');
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Engineered for Modern Merchants</h2>
          <p className="text-slate-400 max-w-md mx-auto">Built with security and visual excellence to give you a unified portal to track payment receipts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 border border-slate-800/80 p-8 rounded-2xl hover:border-purple-600/30 transition">
            <div className="bg-purple-950/50 p-3 rounded-xl inline-block mb-6">
              <QrCode className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Dynamic Custom QR</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Customize overlays, logo centers, styling colors, frames and margins for brand consistency.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-8 rounded-2xl hover:border-purple-600/30 transition">
            <div className="bg-blue-950/50 p-3 rounded-xl inline-block mb-6">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure Webhook Handlers</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Integrated directly via Razorpay checkout, ensuring secure instant verification upon transaction.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 p-8 rounded-2xl hover:border-purple-600/30 transition">
            <div className="bg-indigo-950/50 p-3 rounded-xl inline-block mb-6">
              <Activity className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Charts measuring daily, weekly and monthly transactions volume, refund requests and method usage.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-slate-900 bg-slate-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Get started for free or unlock unlimited templates and custom brand styling with our Pro plan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Starter</h3>
                <p className="text-slate-400 text-sm mb-6">For small merchants getting started.</p>
                <span className="text-4xl font-bold text-white">₹0</span>
                <span className="text-slate-400">/ forever</span>

                <ul className="mt-8 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Single UPI VPA</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Standard QR generation</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Basic Transaction history</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Sign Up Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-purple-950/20 border-2 border-purple-600 p-8 rounded-3xl flex flex-col justify-between relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Popular
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Not Avaliable Now</h3>
                <p className="text-purple-300 text-sm mb-6">For scaling business owners.</p>
                <span className="text-4xl font-bold text-white">₹1,499</span>
                <span className="text-slate-400">/ month</span>

                <ul className="mt-8 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Multiple UPI VPAs supported</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Fully Custom branding & Logo overlays</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Full Analytics and PDF Report Exports</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    <span>Priority Support Tickets</span>
                  </li>
                </ul>
              </div>
              <button
                disabled
                className="mt-8 w-full py-3 bg-purple-900/20 border border-purple-900/30 text-purple-400/40 font-semibold rounded-xl cursor-not-allowed transition"
              >
                Go Pro Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full px-6 py-4 text-left font-medium text-white flex items-center justify-between hover:bg-slate-800/50 transition focus:outline-none"
              >
                <span>{faq.q}</span>
                <HelpCircle className={`h-5 w-5 text-purple-400 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === index && (
                <div className="px-6 pb-4 text-sm text-slate-400 border-t border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs">
          <p>© 2026 QRPay Pro Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-300">Contact Support</Link>
            <Link to="/login?admin=true" className="hover:text-purple-400 text-purple-500 font-semibold transition">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
