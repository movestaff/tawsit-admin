import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: any;
  selectedSocieteId: string | null;

  login: (token: string, user: any) => void;
  setSocieteId: (societeId: string) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
  initAuthListener: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  selectedSocieteId: localStorage.getItem('selectedSocieteId'),

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ isAuthenticated: true, token, user });
  },

  setSocieteId: (societeId) => {
    localStorage.setItem('selectedSocieteId', societeId);
    localStorage.setItem('societeSelectionneeManuellement', 'true');
    set({ selectedSocieteId: societeId });
  },

  logout: () => {
    localStorage.clear();
    set({ isAuthenticated: false, token: null, user: null, selectedSocieteId: null });
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  },

  checkSession: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      set({ isAuthenticated: false, token: null, user: null });
      useAuthStore.getState().logout(); // Appelle logout propre
    } else {
      set({ isAuthenticated: true, token: data.session.access_token, user: data.session.user });
    }
  },

  initAuthListener: () => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        useAuthStore.getState().logout(); // Appelle logout propre
      } else {
        set({ isAuthenticated: true, token: session.access_token, user: session.user });
      }
    });
  },
}));
