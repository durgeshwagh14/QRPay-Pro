import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, QrCode, CreditCard, Users, LogOut, Menu, X, ShieldCheck, Calculator, Settings as SettingsIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../lib/api.js';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, business, clearAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const location = useLocation();
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  if (isAdmin && (location.pathname === '/dashboard' || location.pathname === '/dashboard/')) {
    return <Navigate to="/dashboard/admin-users" replace />;
  }

  const navLinks = isAdmin
    ? [
        { to: '/dashboard/admin-users', label: 'Admin Panel', icon: ShieldCheck },
        { to: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
      ]
    : [
        { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
        { to: '/dashboard/generate-qr', label: 'Generate QR', icon: QrCode },
        { to: '/dashboard/transactions', label: 'Transactions', icon: CreditCard },
        { to: '/dashboard/customers', label: 'Customers', icon: Users },
        { to: '/dashboard/calculator', label: 'Smart Calculator', icon: Calculator },
        { to: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
      ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-50 transition-transform duration-300 flex flex-col justify-between lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-1.5 rounded-lg">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-md">QRPay Pro</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-purple-600/15 text-purple-400 border border-purple-800/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="h-10 w-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-purple-400 font-bold text-sm uppercase shrink-0">
              {user?.ownerName.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.ownerName}</p>
              <p className="text-xs text-slate-500 truncate">{business?.name || 'My Business'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition focus:outline-none cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-slate-950 border-b border-slate-900 sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white mr-4 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-white">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-950/40 border border-green-900/50 rounded-full">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-400 font-medium">Merchant Verified</span>
            </div>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
