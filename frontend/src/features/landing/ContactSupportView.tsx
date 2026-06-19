import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Mail, Phone, Clock, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/api.js';

export default function ContactSupportView() {
  const [supportConfig, setSupportConfig] = useState({
    emailSupport: 'Not Avaliable',
    helpline: 'Not Avaliable',
    responseTime: '10am - 6 pm',
    emergencySettlement: 'For payment gateway delays, please write to our priority settlement desk at settlements@qrpaypro.com.',
    merchantAssistanceText: 'Our support team is online 24/7 to resolve API configurations, transaction issues, gateway settlements, and logo customization settings.',
  });

  useEffect(() => {
    document.title = "Contact Support - QRPay Pro";
    const fetchConfig = async () => {
      try {
        const res = await api.get('/support/config');
        if (res.data?.data) {
          setSupportConfig(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load support config:', err);
      }
    };
    fetchConfig();
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('billing');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticketNum, setTicketNum] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/support/tickets', {
        name,
        email,
        subject,
        message,
      });
      const id = res.data.data._id;
      setTicketNum(id ? id.slice(-6).toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString());
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit help request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col space-y-4">
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-white transition text-xs font-semibold space-x-1.5 w-fit">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit">Contact Support</h1>
              <p className="text-xs text-slate-400 mt-1">Get fast assistance from our merchant support specialists.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Support Channels Info Panel (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <h3 className="text-md font-bold text-white mb-2">Merchant Assistance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {supportConfig.merchantAssistanceText}
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-purple-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Support</div>
                    <span className="text-xs text-slate-350 font-semibold">{supportConfig.emailSupport}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-purple-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Toll-Free Helpline</div>
                    <span className="text-xs text-slate-350 font-semibold">{supportConfig.helpline}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-purple-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Response Time</div>
                    <span className="text-xs text-slate-350 font-semibold">{supportConfig.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-2xl flex items-start space-x-2">
              <ShieldAlert className="h-4.5 w-4.5 text-purple-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-purple-300 leading-normal">
                <strong>Emergency Settlement:</strong> {supportConfig.emergencySettlement}
              </p>
            </div>
          </div>

          {/* Ticket Request Form (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-xl">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="p-4 bg-green-500/10 text-green-400 border border-green-500/25 rounded-full">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-white">Support Ticket Registered!</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  We have successfully queued your message under reference ticket <strong className="text-purple-400">#TK-{ticketNum}</strong>. One of our payment operators will email you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-sm font-bold text-white">Submit Help Request</h3>
                
                {errorMsg && (
                  <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-xl">
                    {errorMsg}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Merchant Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Contact Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@business.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-white text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Help Category</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-white text-xs"
                  >
                    <option value="billing">API & QR Code Generation Issues</option>
                    <option value="settlement">Refunds & Settlements Delay</option>
                    <option value="profile">Profile, Settings, & UPI Registration</option>
                    <option value="general">General Commercial & SaaS Billing Enquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Message Description</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in details (include transaction/invoice IDs if applicable)..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-white text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-lg shadow-purple-500/10"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Ticket</span>
                </button>

              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
