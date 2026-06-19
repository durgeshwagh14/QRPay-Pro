import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'owner' | 'employee' | 'accountant' | 'customer';
  ownerName: string;
  mobile?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  avatar?: string;
}

interface Business {
  _id: string;
  name: string;
  upiIds: string[];
  logo?: string;
  brandColor?: string;
  tagline?: string;
  gstin?: string;
  pan?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

interface AuthState {
  user: User | null;
  business: Business | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, business: Business | null, token: string) => void;
  updateBusiness: (business: Business) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  business: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, business, token) => {
    localStorage.setItem('token', token);
    set({ user, business, token, isAuthenticated: true });
  },

  updateBusiness: (business) => {
    set({ business });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, business: null, token: null, isAuthenticated: false });
  },
}));
