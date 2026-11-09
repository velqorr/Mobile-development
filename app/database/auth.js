import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { utf8ToBytes, bytesToHex } from '@noble/hashes/utils';

const DATABASE_NAME = 'moneyflow.db';
const ITERATIONS = 310000;
let databasePromise;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL COLLATE NOCASE UNIQUE,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          salt TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      return db;
    })();
  }
  return databasePromise;
}

async function hashPassword(password, salt) {
  const result = await pbkdf2Async(
    sha256,
    utf8ToBytes(password),
    salt,
    { c: ITERATIONS, dkLen: 32 }
  );
  return bytesToHex(result);
}

export async function registerUser(email, name, password) {
  try {
    const db = await getDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.getFirstAsync(
      'SELECT id FROM users WHERE email = ?',
      normalizedEmail
    );

    if (existing) {
      return { success: false, message: 'Этот email уже зарегистрирован' };
    }

    const salt = await Crypto.getRandomBytesAsync(16);
    const passwordHash = await hashPassword(password, salt);

    await db.runAsync(
      'INSERT INTO users (email, name, password_hash, salt) VALUES (?, ?, ?, ?)',
      normalizedEmail,
      name.trim(),
      passwordHash,
      bytesToHex(salt)
    );

    const user = await db.getFirstAsync(
      'SELECT id, email, name FROM users WHERE email = ?',
      normalizedEmail
    );

    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Не удалось создать аккаунт' };
  }
}

export async function loginUser(email, password) {
  try {
    const db = await getDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.getFirstAsync(
      'SELECT id, email, name, password_hash, salt FROM users WHERE email = ?',
      normalizedEmail
    );

    if (!user) {
      return { success: false, message: 'Неверный email или пароль' };
    }

    const salt = Uint8Array.from(
      user.salt.match(/.{2}/g).map((part) => parseInt(part, 16))
    );
    const enteredHash = await hashPassword(password, salt);

    if (enteredHash !== user.password_hash) {
      return { success: false, message: 'Неверный email или пароль' };
    }

    return {
      success: true,
      user: { id: user.id, email: user.email, name: user.name }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Ошибка авторизации' };
  }
}
