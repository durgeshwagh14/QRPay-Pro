import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, Lock, Mail, User, Building, Landmark, Smartphone, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../lib/api.js';

const registerSchema = z.object({
  businessName: z.string().min(2, 'Business Name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format (e.g. name@bank)'),
});

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterView() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/auth/register', data);
      const generatedOtp = res.data?.data?.otp || '';
      navigate('/verify', { state: { email: data.email, otp: generatedOtp } });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl shadow-purple-500/5">
        <Link to="/" className="inline-flex items-center text-slate-500 hover:text-white transition text-xs font-semibold mb-6 space-x-1.5 cursor-pointer">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="text-center mb-8">
          <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-3 rounded-2xl inline-block shadow-lg mb-4">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Business Account</h2>
          <p className="text-slate-400 text-sm mt-1">Start collecting verified QR payments</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 text-red-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business Name</label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                {...register('businessName')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm"
                placeholder="Acme Corp"
              />
            </div>
            {errors.businessName && (
              <p className="text-red-500 text-xs mt-1.5">{errors.businessName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Owner Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                {...register('ownerName')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm"
                placeholder="John Doe"
              />
            </div>
            {errors.ownerName && (
              <p className="text-red-500 text-xs mt-1.5">{errors.ownerName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary UPI ID</label>
            <div className="relative">
              <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                {...register('upiId')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm"
                placeholder="john@okaxis"
              />
            </div>
            {errors.upiId && (
              <p className="text-red-500 text-xs mt-1.5">{errors.upiId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email"
                {...register('email')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm"
                placeholder="john@business.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                {...register('mobile')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm"
                placeholder="9876543210"
              />
            </div>
            {errors.mobile && (
              <p className="text-red-500 text-xs mt-1.5">{errors.mobile.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="password"
                {...register('password')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm"
                placeholder="•••••••• (Min 8 chars)"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="md:col-span-2 w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer mt-4"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          <span>Already registered? </span>
          <Link to="/login" className="text-purple-400 hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
