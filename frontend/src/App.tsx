import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore.js';
import api from './lib/api.js';

import LandingView from './features/landing/LandingView.js';
import LoginView from './features/auth/LoginView.js';
import RegisterView from './features/auth/RegisterView.js';
import VerifyView from './features/auth/VerifyView.js';
import CheckoutView from './features/payments/CheckoutView.js';
import DashboardLayout from './features/dashboard/DashboardLayout.js';
import OverviewSubView from './features/dashboard/OverviewSubView.js';
import QRGeneratorSubView from './features/dashboard/QRGeneratorSubView.js';
import TransactionsSubView from './features/dashboard/TransactionsSubView.js';
import CustomersSubView from './features/dashboard/CustomersSubView.js';
import AdminUsersSubView from './features/dashboard/AdminUsersSubView.js';
import SmartCalculatorSubView from './features/dashboard/SmartCalculatorSubView.js';
import SettingsSubView from './features/dashboard/SettingsSubView.js';
import PrivacyPolicyView from './features/landing/PrivacyPolicyView.js';
import TermsOfServiceView from './features/landing/TermsOfServiceView.js';
import ContactSupportView from './features/landing/ContactSupportView.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { setAuth, clearAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await api.get('/auth/me');
        setAuth(res.data.data.user, res.data.data.business, token);
      } catch (err) {
        clearAuth();
      }
    };
    fetchUser();
  }, [setAuth, clearAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginView />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterView />} />
        <Route path="/verify" element={<VerifyView />} />
        <Route path="/pay/:shortId" element={<CheckoutView />} />
        <Route path="/privacy" element={<PrivacyPolicyView />} />
        <Route path="/terms" element={<TermsOfServiceView />} />
        <Route path="/contact" element={<ContactSupportView />} />

        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<OverviewSubView />} />
          <Route path="generate-qr" element={<QRGeneratorSubView />} />
          <Route path="transactions" element={<TransactionsSubView />} />
          <Route path="customers" element={<CustomersSubView />} />
          <Route path="admin-users" element={<AdminUsersSubView />} />
          <Route path="calculator" element={<SmartCalculatorSubView />} />
          <Route path="settings" element={<SettingsSubView />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
