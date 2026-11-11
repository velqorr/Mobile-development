
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { useFinanceStore } from './financeStore';

let authSubscription = null;

const mapUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || '',
  };
};

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  hasHydrated: false,

  initialize: async () => {
    if (get().hasHydrated) return;

    if (!authSubscription) {
      const { data } = supabase.auth.onAuthStateChange(
        (event, session) => {
          set({
            session,
            user: mapUser(session?.user),
            isAuthenticated: !!session,
          });

          if (event === 'SIGNED_OUT') {
            useFinanceStore.getState().clearTransactions();
          }
        }
      );

      authSubscription = data.subscription;
    }

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      set({
        session: data.session,
        user: mapUser(data.session?.user),
        isAuthenticated: !!data.session,
        hasHydrated: true,
      });
    } catch (error) {
      console.error(
        '[AuthStore] Ошибка восстановления сессии:',
        error
      );

      set({
        session: null,
        user: null,
        isAuthenticated: false,
        hasHydrated: true,
      });
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    useFinanceStore.getState().clearTransactions();

    set({
      user: null,
      session: null,
      isAuthenticated: false,
    });
  },
}));

