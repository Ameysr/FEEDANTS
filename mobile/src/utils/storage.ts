import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Cross-platform secure-ish storage.
 * Native uses expo-secure-store (Keychain / Keystore); web falls back to
 * localStorage because SecureStore has no web implementation.
 */
const isWeb = Platform.OS === 'web';

export const TOKEN_KEY = 'feedants.accessToken';

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    try {
      if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      if (isWeb) globalThis.localStorage?.setItem(key, value);
      else await SecureStore.setItemAsync(key, value);
    } catch {
      // Storage failures must never break the auth flow.
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (isWeb) globalThis.localStorage?.removeItem(key);
      else await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};
