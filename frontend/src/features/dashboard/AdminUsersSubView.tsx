import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Settings, Loader2, Search, CheckCircle, XCircle, ShieldAlert, Save, Building, Landmark, Smartphone, User, Globe, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../lib/api.js';

export default function AdminUsersSubView() {
  const queryClient = useQueryClient();
  const { user, business, setAuth } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'tickets'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab 1: Fetch registered users list
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsersList'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.data;
    },
    enabled: activeTab === 'users',
  });

  // Tab 3: Fetch support tickets
  const { data: tickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['adminTicketsList'],
    queryFn: async () => {
      const res = await api.get('/admin/tickets');
      return res.data.data;
    },
    enabled: activeTab === 'tickets',
  });

  // Ticket Status Update Mutation
  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.patch(`/admin/tickets/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTicketsList'] });
    },
  });

  // Support Config Form States
  const [supportEmail, setSupportEmail] = useState('Not Avaliable');
  const [supportHelpline, setSupportHelpline] = useState('Not Avaliable');
  const [supportResponseTime, setSupportResponseTime] = useState('10am - 6 pm');
  const [supportEmergencyText, setSupportEmergencyText] = useState('');
  const [supportAssistanceText, setSupportAssistanceText] = useState('');
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string | null>(null);

  // Fetch support config
  const { data: supportConfig } = useQuery({
    queryKey: ['adminSupportConfig'],
    queryFn: async () => {
      const res = await api.get('/support/config');
      return res.data.data;
    },
  });

  // Populate state when supportConfig changes
  useEffect(() => {
    if (supportConfig) {
      setSupportEmail(supportConfig.emailSupport || 'Not Avaliable');
      setSupportHelpline(supportConfig.helpline || 'Not Avaliable');
      setSupportResponseTime(supportConfig.responseTime || '10am - 6 pm');
      setSupportEmergencyText(supportConfig.emergencySettlement || '');
      setSupportAssistanceText(supportConfig.merchantAssistanceText || '');
    }
  }, [supportConfig]);

  // Update Support Config Mutation
  const updateSupportConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put('/admin/support/config', data);
      return res.data;
    },
    onSuccess: () => {
      setConfigSuccessMsg('Support details updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminSupportConfig'] });
      setTimeout(() => setConfigSuccessMsg(null), 3000);
    },
  });

  // Tab 2: Profile Update Form Fields State
  const [ownerName, setOwnerName] = useState(user?.ownerName || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [businessName, setBusinessName] = useState(business?.name || '');
  const [upiId, setUpiId] = useState(business?.upiIds?.[0] || '');
  const [logo, setLogo] = useState(business?.logo || '');
  const [tagline, setTagline] = useState(business?.tagline || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put('/auth/profile', data);
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMessage('Profile and branding updated successfully!');
      // Update local Zustand store
      setAuth(data.data.user, data.data.business, localStorage.getItem('token') || '');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      ownerName,
      mobile,
      businessName,
      upiId,
      logo,
      tagline,
    });
  };

  // Filter users based on query
  const filteredUsers = users?.filter((u: any) => {
    const query = searchQuery.toLowerCase();
    return (
      u.ownerName?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.business?.name?.toLowerCase().includes(query)
    );
  });

  // Filter support tickets based on query
  const filteredTickets = tickets?.filter((t: any) => {
    const query = searchQuery.toLowerCase();
    return (
      t.name?.toLowerCase().includes(query) ||
      t.email?.toLowerCase().includes(query) ||
      t.subject?.toLowerCase().includes(query) ||
      t.message?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition cursor-pointer border-b-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Registered Users</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition cursor-pointer border-b-2 ${
            activeTab === 'settings'
              ? 'border-purple-600 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Admin Profile Settings</span>
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition cursor-pointer border-b-2 ${
            activeTab === 'tickets'
              ? 'border-purple-600 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Support Tickets</span>
        </button>
      </div>

      {/* Tab 1 Content: Users Table */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h3 className="text-md font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-purple-500" />
              <span>Registered Merchant Accounts</span>
            </h3>
            
            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {usersLoading ? (
            <div className="h-60 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
              <span className="text-xs text-slate-500 mt-2">Loading user index...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                    <th className="pb-3">Owner Details</th>
                    <th className="pb-3">Business Profile</th>
                    <th className="pb-3">Primary UPI</th>
                    <th className="pb-3">Verification</th>
                    <th className="pb-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((u: any) => (
                      <tr key={u._id} className="hover:bg-slate-800/10 transition">
                        <td className="py-4">
                          <div className="font-bold text-white text-sm">{u.ownerName}</div>
                          <div className="text-[10px] text-slate-500">{u.email}</div>
                          <div className="text-[10px] text-slate-500">{u.mobile || 'No Mobile'}</div>
                        </td>
                        <td className="py-4">
                          <div className="font-semibold text-slate-200">{u.business?.name || 'N/A'}</div>
                          <div className="text-[10px] text-purple-400 capitalize font-medium">{u.role}</div>
                        </td>
                        <td className="py-4 font-mono font-bold text-white">
                          {u.business?.upiIds?.[0] || 'N/A'}
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col space-y-1">
                            <span className="flex items-center space-x-1">
                              {u.isEmailVerified ? (
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                              )}
                              <span className="text-[10px]">Email</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              {u.isMobileVerified ? (
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                              )}
                              <span className="text-[10px]">Mobile</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-600 font-semibold">
                        No registered merchants match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: Admin Profile Settings Form */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl p-6 max-w-2xl">
          <div className="mb-6">
            <h3 className="text-md font-bold text-white flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-500" />
              <span>Modify Admin Personal & Brand Details</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Configure your dashboard personal info, business settings, and dynamic QR branding details.</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-950/40 border border-green-900/50 text-green-300 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Owner Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Admin Full Name</label>
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

              {/* Mobile Number */}
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

              {/* Business Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Business / HQ Name</label>
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

              {/* Primary UPI ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary VPA (UPI ID)</label>
                <div className="relative">
                  <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs"
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Logo URL (Icon overlay)</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Brand Tagline</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Premium QR Solutions"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile Details</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
      {activeTab === 'tickets' && (
        <div className="space-y-8">
          {/* Support configuration editor */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl p-6">
            <div className="mb-6">
              <h3 className="text-md font-bold text-white flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-500" />
                <span>Configure Support Help Page Details</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">Manage the details and settings shown on the public Contact Support help page.</p>
            </div>

            {configSuccessMsg && (
              <div className="mb-6 p-4 bg-green-950/40 border border-green-900/50 text-green-300 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{configSuccessMsg}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSupportConfigMutation.mutate({
                  emailSupport: supportEmail,
                  helpline: supportHelpline,
                  responseTime: supportResponseTime,
                  emergencySettlement: supportEmergencyText,
                  merchantAssistanceText: supportAssistanceText,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Support</label>
                  <input
                    type="text"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2 px-3 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Toll-Free Helpline</label>
                  <input
                    type="text"
                    value={supportHelpline}
                    onChange={(e) => setSupportHelpline(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2 px-3 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Response Time</label>
                  <input
                    type="text"
                    value={supportResponseTime}
                    onChange={(e) => setSupportResponseTime(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2 px-3 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Merchant Assistance Description</label>
                <textarea
                  rows={2}
                  value={supportAssistanceText}
                  onChange={(e) => setSupportAssistanceText(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2 px-3 text-white text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Emergency Settlement Banner Note</label>
                <textarea
                  rows={2}
                  value={supportEmergencyText}
                  onChange={(e) => setSupportEmergencyText(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2 px-3 text-white text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={updateSupportConfigMutation.isPending}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-lg shadow-purple-500/10"
              >
                {updateSupportConfigMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Support Details</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tickets List Table */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <h3 className="text-md font-bold text-white flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <span>Merchant Support Tickets</span>
              </h3>
              
              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets by subject, description..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {ticketsLoading ? (
              <div className="h-60 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                <span className="text-xs text-slate-500 mt-2">Loading support tickets...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-semibold">
                      <th className="pb-3">Ticket ID</th>
                      <th className="pb-3">Merchant Info</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Message Details</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredTickets && filteredTickets.length > 0 ? (
                      filteredTickets.map((t: any) => (
                        <tr key={t._id} className="hover:bg-slate-800/10 transition">
                          <td className="py-4 font-mono font-bold text-white text-[11px]">
                            #TK-{t._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-4">
                            <div className="font-bold text-white text-sm">{t.name}</div>
                            <div className="text-[10px] text-slate-500">{t.email}</div>
                          </td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 text-[10px] rounded-full font-semibold capitalize bg-purple-950/40 text-purple-400 border border-purple-900/30">
                              {t.subject}
                            </span>
                          </td>
                          <td className="py-4 max-w-xs">
                            <p className="text-slate-300 break-words leading-relaxed">{t.message}</p>
                            <span className="text-[9px] text-slate-500 block mt-1">Submitted: {new Date(t.createdAt).toLocaleString()}</span>
                          </td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                              t.status === 'open'
                                ? 'bg-amber-950/40 text-amber-400 border-amber-900/30'
                                : t.status === 'resolved'
                                ? 'bg-green-950/40 text-green-400 border-green-900/30'
                                : 'bg-slate-950/40 text-slate-400 border-slate-900/30'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {t.status === 'open' && (
                                <button
                                  onClick={() => updateTicketStatusMutation.mutate({ id: t._id, status: 'resolved' })}
                                  disabled={updateTicketStatusMutation.isPending}
                                  className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-[10px] rounded-lg transition disabled:bg-green-800 cursor-pointer"
                                >
                                  Mark Resolved
                                </button>
                              )}
                              {t.status !== 'closed' && (
                                <button
                                  onClick={() => updateTicketStatusMutation.mutate({ id: t._id, status: 'closed' })}
                                  disabled={updateTicketStatusMutation.isPending}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px] border border-slate-700 rounded-lg transition disabled:bg-slate-900 cursor-pointer"
                                >
                                  Close Ticket
                                </button>
                              )}
                              {t.status === 'closed' && (
                                <button
                                  onClick={() => updateTicketStatusMutation.mutate({ id: t._id, status: 'open' })}
                                  disabled={updateTicketStatusMutation.isPending}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] rounded-lg transition disabled:bg-amber-800 cursor-pointer"
                                >
                                  Reopen
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-600 font-semibold">
                          No support tickets found matching search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
