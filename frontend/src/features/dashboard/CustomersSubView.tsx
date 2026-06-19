import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Users, Search, Plus, Mail, Smartphone, MapPin, X, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuthStore } from '../../store/authStore.js';

const customerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits').or(z.literal('')),
  address: z.string().optional(),
});

type CustomerFormFields = z.infer<typeof customerFormSchema>;

export default function CustomersSubView() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customersList'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormFields>({
    resolver: zodResolver(customerFormSchema),
  });

  const addMutation = useMutation({
    mutationFn: async (data: CustomerFormFields) => {
      // Clean empty fields
      const payload: any = { name: data.name, address: data.address };
      if (data.email) payload.email = data.email;
      if (data.mobile) payload.mobile = data.mobile;
      const res = await api.post('/customers', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customersList'] });
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to add customer');
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const res = await api.delete(`/customers/${customerId}`);
      return res.data;
    },
    onSuccess: () => {
      alert('Customer deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['customersList'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete customer');
    },
  });

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer profile? This action cannot be undone.')) {
      deleteCustomerMutation.mutate(customerId);
    }
  };

  const onSubmit = (data: CustomerFormFields) => {
    setErrorMsg('');
    addMutation.mutate(data);
  };

  const filteredCustomers = customers?.filter((cust: any) =>
    cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cust.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cust.mobile || '').includes(searchTerm) ||
    (cust.businessId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        <span className="text-xs text-slate-500 mt-3">Loading directory registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Merchant Directory</h2>
          <p className="text-xs text-slate-400 mt-1">Manage regular customer profiles for streamlined billing</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-xs font-semibold rounded-xl text-white transition shadow-lg cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 text-xs"
          placeholder={isAdmin ? "Filter customers by name, email, phone or merchant..." : "Filter customers by name, email or phone..."}
        />
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers && filteredCustomers.length > 0 ? (
          filteredCustomers.map((cust: any) => (
            <div key={cust._id} className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl relative shadow-xl hover:border-slate-700 transition">
              {isAdmin && cust.businessId?.name && (
                <div className="absolute top-6 right-6 px-2 py-0.5 bg-purple-950/40 border border-purple-900/50 rounded-full text-[9px] text-purple-400 font-semibold max-w-[120px] truncate">
                  {cust.businessId.name}
                </div>
              )}
              <div className="flex items-center space-x-3.5 mb-4">
                <div className="h-10 w-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-purple-400 font-bold text-sm uppercase">
                  {cust.name.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{cust.name}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Business client</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-400 font-medium">
                {cust.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-slate-600" />
                    <span>{cust.email}</span>
                  </div>
                )}
                {cust.mobile && (
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-slate-600" />
                    <span>{cust.mobile}</span>
                  </div>
                )}
                {cust.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                    <span className="leading-normal">{cust.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-end">
                <button
                  onClick={() => handleDeleteCustomer(cust._id)}
                  disabled={deleteCustomerMutation.isPending}
                  className="text-slate-500 hover:text-red-400 transition text-[11px] font-semibold flex items-center space-x-1.5 focus:outline-none cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Customer</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12 bg-slate-900/30 border border-slate-800/50 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-500 text-xs">
            <Users className="h-10 w-10 text-slate-700 mb-3 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-slate-600">No Customers Added</span>
            <span className="mt-1 text-[11px] text-slate-600 max-w-xs leading-normal">Register repeat clients to auto-populate invoices and simplify billing QR generation.</span>
          </div>
        )}
      </div>

      {/* Add Customer Modal Drawer */}
      {isAddOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-8 relative">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute right-6 top-6 text-slate-500 hover:text-white focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-6">Register Customer Profile</h3>

            {errorMsg && (
              <div className="mb-4 p-4 bg-red-950/30 border border-red-900/50 text-red-200 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-white text-xs"
                  placeholder="Jane Smith"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address (Optional)</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-white text-xs"
                  placeholder="jane@business.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mobile Phone (Optional)</label>
                <input
                  type="text"
                  {...register('mobile')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-white text-xs"
                  placeholder="9876543210"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.mobile.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mailing Address (Optional)</label>
                <input
                  type="text"
                  {...register('address')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 rounded-xl py-2.5 px-4 text-white text-xs"
                  placeholder="123 Main St, New Delhi"
                />
              </div>

              <button
                type="submit"
                disabled={addMutation.isPending}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-2 cursor-pointer mt-4"
              >
                {addMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span>Register Customer</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
