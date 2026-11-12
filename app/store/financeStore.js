
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      hasHydrated: false,

      // Загрузка операций из Supabase
      loadTransactions: async (userId) => {
        if (!userId) {
          set({ transactions: [], isLoading: false });
          return [];
        }

        set({ isLoading: true });

        try {
          const { data, error } = await supabase
            .from('transactions')
            .select('id, user_id, data, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const transactions = (data || []).map((row) => ({
            ...row.data,
            id: row.id,
            userId: row.user_id
          }));

          set({
            transactions,
            isLoading: false
          });

          return transactions;
        } catch (error) {
          set({ isLoading: false });
          console.error('[FinanceStore] Ошибка загрузки:', error);
          throw error;
        }
      },

      // Добавление операции
      addTransaction: async (userId, transaction) => {
        if (!userId) {
          throw new Error('Пользователь не авторизован');
        }

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

        try {
          const { error } = await supabase
            .from('transactions')
            .insert({
              id: item.id,
              user_id: userId,
              data: item
            });

          if (error) throw error;

          set((state) => ({
            transactions: [item, ...state.transactions]
          }));

          return item;
        } catch (error) {
          console.error('[FinanceStore] Ошибка добавления:', error);
          throw error;
        }
      },

      // Изменение операции
      updateTransaction: async (id, changes) => {
        try {
          const { data: authData, error: authError } =
            await supabase.auth.getUser();

          if (authError) throw authError;

          const user = authData.user;

          if (!user) {
            throw new Error('Пользователь не авторизован');
          }

          const current = get().transactions.find(
            (item) => item.id === id
          );

          if (!current) {
            throw new Error('Операция не найдена');
          }

          const updatedItem = {
            ...current,
            ...changes
          };

          const { error } = await supabase
            .from('transactions')
            .update({ data: updatedItem })
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          set((state) => ({
            transactions: state.transactions.map((item) =>
              item.id === id ? updatedItem : item
            )
          }));

          return updatedItem;
        } catch (error) {
          console.error('[FinanceStore] Ошибка изменения:', error);
          throw error;
        }
      },

      // Удаление операции
      deleteTransaction: async (id) => {
        try {
          const { data: authData, error: authError } =
            await supabase.auth.getUser();

          if (authError) throw authError;

          const user = authData.user;

          if (!user) {
            throw new Error('Пользователь не авторизован');
          }

          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          set((state) => ({
            transactions: state.transactions.filter(
              (item) => item.id !== id
            )
          }));
        } catch (error) {
          console.error('[FinanceStore] Ошибка удаления:', error);
          throw error;
        }
      },

      clearTransactions: () => {
        set({ transactions: [] });
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      }
    }),

    {
      name: 'moneyflow-finance-clean',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        transactions: state.transactions
      }),

      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn(
            '[FinanceStore] Ошибка восстановления:',
            error
          );
        }

        useFinanceStore.setState({ hasHydrated: true });
      }
    }
  )
);

