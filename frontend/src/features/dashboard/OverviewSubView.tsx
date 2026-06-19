import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard, Landmark, Users, DollarSign, Activity, Loader2, ArrowRight, QrCode, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api.js';

export default function OverviewSubView() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['overviewStats'],
    queryFn: async () => {
      const res = await api.get('/analytics/overview');
      return res.data.data;
    },
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['revenueTrend'],
    queryFn: async () => {
      const res = await api.get('/analytics/trend?period=daily');
      return res.data.data;
    },
  });

  const { data: recentTxns, isLoading: txnsLoading } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: async () => {
      const res = await api.get('/payments/transactions');
      return res.data.data.slice(0, 5); // Display top 5
    },
  });

  if (statsLoading || chartLoading || txnsLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        <span className="text-xs text-slate-500 mt-3">Loading analytics metrics...</span>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats?.revenue.toLocaleString() || '0'}`, icon: DollarSign, color: 'text-green-400 bg-green-500/10' },
    { label: 'Total Transactions', value: stats?.totalTransactions || '0', icon: CreditCard, color: 'text-purple-400 bg-purple-500/10' },
    { label: 'Successful Payments', value: stats?.successfulPayments || '0', icon: Landmark, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Active QRs', value: stats?.qrGenerated || '0', icon: Activity, color: 'text-indigo-400 bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2.5 rounded-xl ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">{card.value}</span>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl">
        <h3 className="text-md font-bold text-white mb-6">Revenue Trend (Last 30 Days)</h3>
        <div className="h-80 w-full">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}
                  itemStyle={{ color: '#a78bfa', fontSize: '12px', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs font-semibold">
              No transactions recorded yet. Generated payments will show up here.
            </div>
          )}
        </div>
      </div>

      {/* Bottom section: Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-bold text-white">Recent Payments</h3>
            <Link to="/dashboard/transactions" className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500 font-semibold">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Invoice</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentTxns && recentTxns.length > 0 ? (
                  recentTxns.map((txn: any) => (
                    <tr key={txn._id} className="hover:bg-slate-800/10 transition">
                      <td className="py-3 font-semibold text-white">{txn.customerName || 'Walk-in Customer'}</td>
                      <td className="py-3 font-mono">{txn.invoiceNumber || 'N/A'}</td>
                      <td className="py-3 font-bold text-white">₹{txn.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          txn.status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-900/30' :
                          txn.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-900/30' :
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-900/30'
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-600 font-semibold">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-white mb-4">Quick Actions</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Easily generate client billing QR links, download receipts, register new regular customers, and request payment settlements.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              to="/dashboard/generate-qr"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-2"
            >
              <QrCode className="h-4 w-4" />
              <span>Generate Custom QR</span>
            </Link>
            <Link
              to="/dashboard/customers"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Add regular customer</span>
            </Link>
            <Link
              to="/dashboard/calculator"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-2"
            >
              <Calculator className="h-4 w-4 text-purple-400" />
              <span>Smart Calculator</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
