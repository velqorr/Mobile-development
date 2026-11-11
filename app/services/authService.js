
import { supabase } from './supabase';

export async function registerUser(email, name, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        name: name.trim(),
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (!data.session) {
    return {
      success: true,
      needsConfirmation: true,
      user: data.user,
    };
  }

  return {
    success: true,
    needsConfirmation: false,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || name.trim(),
    },
  };
}

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return {
      success: false,
      message: 'Неверный email или пароль',
    };
  }

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || '',
    },
  };
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}


