
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      hasHydrated: false,

      loadTransactions: async (userId) => {
        set({ isLoading: false });
        return get().transactions.filter(
          (item) => String(item.userId) === String(userId)
        );
      },

      addTransaction: async (userId, transaction) => {
        const now = new Date();

        const item = {
          id: `transaction_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
          userId: String(userId),
          type: transaction.type,
          amount: Number(String(transaction.amount).replace(',', '.')),
          currency: 'RUB',
          desc: transaction.desc.trim(),
          time: now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          date: now.toISOString().slice(0, 10),

          category: transaction.category || {
            id: 'other',
            name: 'Другое',
            icon: 'wallet'
          },

          merchant: transaction.merchant || {
            name: transaction.desc.trim(),
            address: '',
            coordinates: null
          },

          paymentMethod: {
            type: 'card',
            name: 'Основная карта'
          },

          status: 'completed',

          statusHistory: [{
            status: 'completed',
            date: now.toISOString()
          }],

          priority: 'normal',

          receipt: {
            image: null,
            description: ''
          }
        };

        set((state) => ({
          transactions: [item, ...state.transactions]
        }));

        return item;
      },

      updateTransaction: async (id, changes) => {
        set((state) => ({
          transactions: state.transactions.map((item) =>
            item.id === id ? { ...item, ...changes } : item
          )
        }));
      },

      deleteTransaction: async (id) => {
        set((state) => ({
          transactions: state.transactions.filter(
            (item) => item.id !== id
          )
        }));
      },

      setHasHydrated: (value) => set({ hasHydrated: value })
    }),
    {
      
      name: 'moneyflow-finance-clean',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        transactions: state.transactions
      }),

      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('[FinanceStore] Ошибка восстановления:', error);
        }

        useFinanceStore.setState({ hasHydrated: true });
      }
    }
  )
);
