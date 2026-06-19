import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { QrCode, Lock, Mail, AlertCircle, Loader2, ShieldAlert, ArrowLeft, X } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginView() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [prevPassword, setPrevPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setIsForgotLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail,
        previousPassword: prevPassword,
        newPassword,
        confirmPassword,
      });
      setResetSent(true);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please check your inputs.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const [searchParams] = useSearchParams();
  const isAdminParam = searchParams.get('admin') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFields) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.post('/auth/login', data);
      const { token } = response.data;
      
      const profileResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAuth(
        profileResponse.data.data.user,
        profileResponse.data.data.business,
        token
      );
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
            {isAdminParam ? <ShieldAlert className="h-8 w-8 text-white" /> : <QrCode className="h-8 w-8 text-white" />}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isAdminParam ? 'Sign In to Admin Portal' : 'Sign In to QRPay Pro'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isAdminParam ? 'System Administration & Management' : 'Access your QR payment dashboard'}
          </p>
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
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email"
                {...register('email')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm"
                placeholder="name@business.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 transition hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="password"
                {...register('password')}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          <span>New to QRPay Pro? </span>
          <Link to="/register" className="text-purple-400 hover:underline">Create an account</Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setForgotModalOpen(false);
                setResetSent(false);
                setForgotEmail('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950 p-1.5 rounded-full border border-slate-800/80 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
              
              {resetSent ? (
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-green-950/30 border border-green-900/50 text-green-300 text-xs rounded-xl">
                    Password reset link sent! Please check your email inbox and spam folder.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setResetSent(false);
                      setForgotEmail('');
                    }}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4 mt-4 text-left max-h-[380px] overflow-y-auto pr-1">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Provide your email and verify your identity with your previous password to set a new password.
                  </p>
                  {forgotError && (
                    <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-200 text-[10px] rounded-lg">
                      {forgotError}
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@business.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2 px-3.5 text-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Previous Password</label>
                    <input
                      type="password"
                      required
                      value={prevPassword}
                      onChange={(e) => setPrevPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2 px-3.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="•••••••• (Min 8 chars)"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2 px-3.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-3.5 text-white text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    {isForgotLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
