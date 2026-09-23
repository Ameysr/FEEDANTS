import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolve the API base URL.
 *
 * Priority:
 *  1. EXPO_PUBLIC_API_URL when set (explicit override / production).
 *  2. The Expo dev-server host, so a physical device on the same LAN reaches
 *     the backend without manual configuration.
 *  3. Sensible platform fallbacks (Android emulator maps host to 10.0.2.2).
 */
function resolveBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured && configured.length > 0) {
    return configured.replace(/\/+$/, '');
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost;

  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:4000/api/v1`;

  if (Platform.OS === 'android') return 'http://10.0.2.2:4000/api/v1';
  return 'http://localhost:4000/api/v1';
}

export const API_BASE_URL = resolveBaseUrl();

export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

/** Error thrown for any non-2xx API response; `code` is the server's stable error code. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// The auth token lives here so the API layer stays free of React state.
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skip the Authorization header even when a token is present. */
  anonymous?: boolean;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, anonymous = false, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!anonymous && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', `Cannot reach the server at ${API_BASE_URL}`);
  }

  const text = await response.text();
  const payload: unknown = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const errorBody = payload as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      errorBody?.error?.code ?? 'INTERNAL_ERROR',
      errorBody?.error?.message ?? `Request failed with status ${response.status}`,
      errorBody?.error?.details,
    );
  }

  const envelope = payload as { success: boolean; data: T } | null;
  if (!envelope || typeof envelope !== 'object' || !('data' in envelope)) {
    throw new ApiError(response.status, 'INVALID_RESPONSE', 'Malformed response from server');
  }
  return envelope.data;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Build a query string from defined values only. */
export function toQueryString(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== '');
  if (entries.length === 0) return '';
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `?${search.toString()}`;
}
