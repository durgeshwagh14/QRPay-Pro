import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { QrCode, ShieldAlert, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../lib/api.js';

const verifySchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

type VerifyFields = z.infer<typeof verifySchema>;

export default function VerifyView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialEmail = location.state?.email || '';
  const initialOtp = location.state?.otp || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFields>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: initialEmail,
      otp: initialOtp,
    },
  });

  const onSubmit = async (data: VerifyFields) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/auth/verify-email', data);
      alert('Email verified successfully! You can now login.');
      navigate('/login');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl shadow-purple-500/5">
        <Link to="/" className="inline-flex items-center text-slate-500 hover:text-white transition text-xs font-semibold mb-6 space-x-1.5 cursor-pointer">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="text-center mb-8">
          <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-3 rounded-2xl inline-block shadow-lg mb-4">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
          <p className="text-slate-400 text-sm mt-1">We sent a 6-digit verification code to your email</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 text-red-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              {...register('email')}
              readOnly={!!initialEmail}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 px-4 text-white text-sm read-only:text-slate-500 read-only:cursor-not-allowed"
              placeholder="name@business.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Verification Code (OTP)</label>
            <input
              type="text"
              maxLength={6}
              {...register('otp')}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-4 text-center tracking-[10px] font-mono text-xl text-white placeholder-slate-800"
              placeholder="000000"
            />
            {errors.otp && (
              <p className="text-red-500 text-xs mt-1.5">{errors.otp.message}</p>
            )}
          </div>

          <div className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-xl flex items-start space-x-2">
            <ShieldAlert className="h-4.5 w-4.5 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-xs text-purple-300 leading-normal">
              <strong>Tip:</strong> If you're running locally in development, check your terminal/console logs for the mock OTP output!
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>Verify Code</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
