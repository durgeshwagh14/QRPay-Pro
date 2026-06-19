import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, AlertTriangle, ShieldCheck, Trash2, Landmark, Check, Plus, User, Smartphone, Building, RefreshCw, LogOut, X, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../lib/api.js';

const PRESET_LOGOS = [
  { name: 'UPI', url: '/logos/upi.png' },
  { name: 'GPay', url: '/logos/gpay.png' },
  { name: 'PhonePe', url: '/logos/phonepe.png' },
  { name: 'Paytm', url: '/logos/paytm.png' },
  { name: 'BHIM', url: '/logos/bhim.png' },
  { name: 'Amazon Pay', url: '/logos/amazonpay.png' }
];

export default function SettingsSubView() {
  const navigate = useNavigate();
  const { user, business, setAuth, clearAuth } = useAuthStore();

  // Profile fields state
  const [ownerName, setOwnerName] = useState(user?.ownerName || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [businessName, setBusinessName] = useState(business?.name || '');
  const [logo, setLogo] = useState(business?.logo || '');
  const [tagline, setTagline] = useState(business?.tagline || '');
  const [brandColor, setBrandColor] = useState(business?.brandColor || '#7c3aed');

  // Multiple UPI IDs state
  const [upiList, setUpiList] = useState<string[]>(business?.upiIds || ['merchant@upi']);
  const [newUpi, setNewUpi] = useState('');
  
  // Notification state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Delete Account modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationWord, setDeleteConfirmationWord] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Update Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/auth/profile', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage('Settings updated successfully!');
      // Update local Zustand store
      setAuth(data.data.user, data.data.business, localStorage.getItem('token') || '');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update settings');
    },
  });

  // Delete Account Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/auth/delete-account');
      return res.data;
    },
    onSuccess: () => {
      setDeleteModalOpen(false);
      clearAuth();
      navigate('/');
    },
    onError: (err: any) => {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      const res = await api.post('/auth/change-password', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setPwdSuccess(data.message || 'Password changed successfully.');
      setPwdError(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(null), 4000);
    },
    onError: (err: any) => {
      setPwdError(err.response?.data?.message || 'Failed to change password.');
      setPwdSuccess(null);
    },
  });

  // UPI IDs manipulation
  const handleAddUpi = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newUpi.trim();
    if (!formatted) return;
    if (!/^[\w.-]+@[\w.-]+$/.test(formatted)) {
      alert('Invalid UPI ID format (e.g. username@bank)');
      return;
    }
    if (upiList.includes(formatted)) {
      alert('This UPI ID is already registered');
      return;
    }
    setUpiList((prev) => [...prev, formatted]);
    setNewUpi('');
  };

  const removeUpi = (indexToRemove: number) => {
    if (upiList.length <= 1) {
      alert('You must keep at least one UPI ID');
      return;
    }
    setUpiList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const setAsPrimaryUpi = (indexToSet: number) => {
    setUpiList((prev) => {
      const selected = prev[indexToSet];
      const filtered = prev.filter((_, idx) => idx !== indexToSet);
      return [selected, ...filtered]; // Selected VPA goes to index 0 (Primary)
    });
  };

  // Submit Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      ownerName,
      mobile,
      businessName,
      upiIds: upiList,
      logo,
      tagline,
      brandColor,
    });
  };

  const handleDeleteAccountConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationWord !== 'DELETE') {
      setDeleteError('Please type the word DELETE correctly.');
      return;
    }
    deleteAccountMutation.mutate();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword, confirmPassword });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Settings className="h-5 w-5 text-purple-400" />
          <span>Profile & Platform Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure your personal profile details, multiple payment UPI addresses, and brand colors.</p>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-950/40 border border-green-900/50 text-green-300 text-xs rounded-xl flex items-center space-x-2">
          <Check className="h-4 w-4 text-green-500" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* Section 1: Merchant Credentials */}
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-3 flex items-center space-x-2">
            <User className="h-4 w-4 text-purple-400" />
            <span>Profile & Business Details</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Owner Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Registered Email (Disabled)</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-slate-500 text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business / Store Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Multiple UPI VPA Addresses */}
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-3 flex items-center space-x-2">
            <Landmark className="h-4 w-4 text-purple-400" />
            <span>Manage Payment UPI Addresses (VPAs)</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed">
            Register multiple UPI VPA addresses. You can toggle between them dynamically when generating dynamic QRs, but the **Primary (Top)** address remains your default routing account.
          </p>

          {/* Add VPA Form */}
          <div className="flex gap-4">
            <input
              type="text"
              value={newUpi}
              onChange={(e) => setNewUpi(e.target.value)}
              placeholder="e.g. newstore@okaxis"
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-purple-600 flex-1 max-w-sm"
            />
            <button
              type="button"
              onClick={handleAddUpi}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 cursor-pointer border border-slate-700 text-slate-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add UPI ID</span>
            </button>
          </div>

          {/* VPA List */}
          <div className="space-y-2 max-w-xl">
            {upiList.map((upi, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-805 rounded-xl text-xs">
                <div className="flex items-center space-x-3">
                  <Landmark className="h-4 w-4 text-slate-500" />
                  <span className="font-mono font-bold text-white">{upi}</span>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 bg-green-950/50 border border-green-900/50 text-green-400 rounded-full font-bold text-[9px] uppercase tracking-wider">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => setAsPrimaryUpi(idx)}
                      className="px-2.5 py-1 bg-purple-950/30 text-purple-400 border border-purple-900/30 rounded-lg text-[10px] font-bold hover:bg-purple-900/35 transition cursor-pointer"
                    >
                      Set Primary
                    </button>
                  )}
                  {upiList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUpi(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Branding & Color Customs */}
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-3 flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-purple-400" />
            <span>Dynamic QR Branding Options</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Store Tagline / Slogan</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Premium payment solutions"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Payment Logo Overlay (UPI / GPay / PhonePe / Paytm / BHIM / Amazon Pay)</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {PRESET_LOGOS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setLogo(p.url)}
                      className={`p-2 bg-slate-950 hover:bg-slate-850 rounded-xl border transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                        logo === p.url ? 'border-purple-600 ring-2 ring-purple-600/30' : 'border-slate-800'
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="h-6 object-contain" />
                      <span className="text-[9px] text-slate-400 font-bold">{p.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex space-x-3 items-center">
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="Or paste custom direct image URL (PNG/JPG)"
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-white text-xs"
                  />
                  {logo && (
                    <button
                      type="button"
                      onClick={() => setLogo('')}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition text-xs font-bold"
                    >
                      Clear Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Brand Accent Color</label>
              <div className="flex items-center space-x-3 mt-1.5">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-12 h-12 bg-transparent border-0 cursor-pointer"
                />
                <div>
                  <div className="text-xs font-mono font-bold text-white uppercase">{brandColor}</div>
                  <span className="text-[10px] text-slate-550">Accent frame color</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {updateSettingsMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-semibold rounded-xl text-xs transition border border-red-900/30 flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </button>
        </div>

      </form>

      {/* ── Change Password Section (separate form) ── */}
      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-white border-b border-slate-850 pb-3 flex items-center space-x-2">
          <KeyRound className="h-4 w-4 text-purple-400" />
          <span>Change Password</span>
        </h3>

        {pwdSuccess && (
          <div className="p-3 bg-green-950/40 border border-green-900/50 text-green-300 text-xs rounded-xl flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}
        {pwdError && (
          <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-300 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showCurrentPwd ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 pl-10 pr-10 text-white text-xs"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showCurrentPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 pl-10 pr-10 text-white text-xs"
              />
              <button
                type="button"
                onClick={() => setShowNewPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showNewPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter new password"
                className={`w-full bg-slate-950 border focus:ring-1 rounded-xl py-2.5 pl-10 pr-10 text-white text-xs ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-600 focus:border-red-600 focus:ring-red-600'
                    : 'border-slate-800 focus:border-purple-600 focus:ring-purple-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              >
                {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[10px] text-red-400 mt-1.5">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-bold rounded-xl text-xs transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-purple-500/20"
          >
            {changePasswordMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Delete Account Modal Drawer (Danger Zone) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-150">
            
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteConfirmationWord('');
                setDeleteError(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950 p-1.5 rounded-full border border-slate-800/80 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center">
              <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-full inline-block mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete Your Merchant Account?</h3>
              <p className="text-xs text-slate-450 leading-relaxed mb-6">
                Warning: This action is permanent! We will delete your user profile, registered businesses, customer lists, payment history, and dynamic QR templates.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 text-red-200 text-[10px] rounded-lg">
                  {deleteError}
                </div>
              )}

              <form onSubmit={handleDeleteAccountConfirm} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-405 uppercase tracking-wider mb-2 text-left">
                    Type the word <span className="font-bold text-white text-xs">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmationWord}
                    onChange={(e) => setDeleteConfirmationWord(e.target.value)}
                    required
                    placeholder="DELETE"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-650 focus:ring-1 focus:ring-red-650 rounded-xl py-2.5 px-4 text-white text-xs text-center font-bold tracking-widest uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={deleteAccountMutation.isPending}
                  className="w-full py-3 bg-red-600 hover:bg-red-750 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  {deleteAccountMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      <span>Confirm Permanent Deletion</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
