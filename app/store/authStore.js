import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false
        }),

      setHasHydrated: (value) =>
        set({ hasHydrated: value })
    }),
    {
      name: 'moneyflow-auth',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),

      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('[AuthStore] Ошибка загрузки:', error);
        }

        useAuthStore.setState({ hasHydrated: true });
      }
    }
  )
);