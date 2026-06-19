import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CreditCard, Search, Download, Undo, ShieldAlert, Loader2, ArrowRight, Trash2 } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';

export default function TransactionsSubView() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactionsList'],
    queryFn: async () => {
      const res = await api.get('/payments/transactions');
      return res.data.data;
    },
  });

  const refundMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await api.post(`/payments/refund/${paymentId}`);
      return res.data;
    },
    onSuccess: () => {
      alert('Payment refunded successfully!');
      queryClient.invalidateQueries({ queryKey: ['transactionsList'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Refund failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const res = await api.delete(`/payments/${paymentId}`);
      return res.data;
    },
    onSuccess: () => {
      alert('Transaction deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['transactionsList'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Delete failed');
    },
  });

  const handleRefund = (paymentId: string, amount: number) => {
    if (confirm(`Are you sure you want to refund ₹${amount}? This action cannot be undone.`)) {
      refundMutation.mutate(paymentId);
    }
  };

  const handleDelete = (paymentId: string) => {
    if (confirm('Are you sure you want to delete this transaction record? This action cannot be undone.')) {
      deleteMutation.mutate(paymentId);
    }
  };

  const filteredTxns = transactions?.filter((txn: any) => {
    const matchesSearch =
      (txn.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.gatewayPaymentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.businessId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    if (!filteredTxns || filteredTxns.length === 0) return;

    const headers = isAdmin 
      ? ['Date', 'Merchant', 'Customer Name', 'Invoice', 'Gateway ID', 'Amount', 'Status']
      : ['Date', 'Customer Name', 'Invoice', 'Gateway ID', 'Amount', 'Status'];
    const rows = filteredTxns.map((t: any) => {
      const basicData = [
        new Date(t.createdAt).toLocaleDateString(),
        t.customerName || 'Walk-in',
        t.invoiceNumber || 'N/A',
        t.gatewayPaymentId || 'N/A',
        t.amount,
        t.status,
      ];
      if (isAdmin) {
        basicData.splice(1, 0, t.businessId?.name || 'N/A');
      }
      return basicData;
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'qrpay_transactions_export.csv');
    document.body.appendChild(link);
    link.click();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        <span className="text-xs text-slate-500 mt-3">Loading transaction ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Payment Transactions</h2>
          <p className="text-xs text-slate-400 mt-1">Verify payment verifications and trigger refund receipts</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl transition border border-slate-700 cursor-pointer"
        >
          <Download className="h-4 w-4 text-purple-400" />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-xs"
            placeholder={isAdmin ? "Search by merchant, customer, invoice or payment id..." : "Search by customer, invoice or payment id..."}
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-slate-200 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                {isAdmin && <th className="px-6 py-4">Merchant</th>}
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredTxns && filteredTxns.length > 0 ? (
                filteredTxns.map((txn: any) => (
                  <tr key={txn._id} className="hover:bg-slate-800/10 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 font-bold text-slate-200">
                        {txn.businessId?.name || 'HQ Admin'}
                      </td>
                    )}
                    <td className="px-6 py-4 font-semibold text-white">
                      {txn.customerName || 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-4 font-mono">{txn.invoiceNumber || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      {txn.gatewayPaymentId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">₹{txn.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        txn.status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-900/30' :
                        txn.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-900/30' :
                        txn.status === 'refunded' ? 'bg-orange-500/10 text-orange-400 border border-orange-900/30' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-900/30'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        {txn.status === 'success' && (
                          <button
                            onClick={() => handleRefund(txn._id, txn.amount)}
                            disabled={refundMutation.isPending}
                            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-950/20 hover:bg-amber-950/40 text-amber-400 font-semibold rounded-lg border border-amber-900/30 transition focus:outline-none cursor-pointer text-[10px]"
                          >
                            <Undo className="h-3 w-3" />
                            <span>Refund</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(txn._id)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center space-x-1.5 px-3 py-1 bg-red-950/20 hover:bg-red-950/40 text-red-400 font-semibold rounded-lg border border-red-900/30 transition focus:outline-none cursor-pointer text-[10px]"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-10 text-slate-600 font-bold text-xs uppercase tracking-wider">
                    No transactions fit your filtering criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
