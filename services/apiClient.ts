/**
 * Reusable HTTP client: abstracts fetch, timeout, headers and JSON parsing.
 * Used by radioApi, myApi and by fetchers in useApiQuery.
 */

import { API_TIMEOUT_MS } from '../constants';

export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export interface ApiClient {
  get<T>(path: string, params?: Record<string, string | number>): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const {
    baseUrl,
    timeoutMs = API_TIMEOUT_MS,
    headers: defaultHeaders = {},
  } = config;

  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  async function request<T>(
    method: 'GET' | 'POST',
    path: string,
    options?: { params?: Record<string, string | number>; body?: unknown }
  ): Promise<T> {
    const pathNormalized = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(base + pathNormalized);
    if (options?.params) {
      Object.entries(options.params).forEach(([k, v]) =>
        url.searchParams.set(k, String(v))
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const init: RequestInit = {
        method,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...defaultHeaders,
        },
      };
      if (method === 'POST' && options?.body !== undefined) {
        init.body = JSON.stringify(options.body);
      }

      const res = await fetch(url.toString(), init);
      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return (await res.json()) as T;
      }
      return (await res.text()) as T;
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  }

  return {
    get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
      return request<T>('GET', path, { params });
    },
    post<T>(path: string, body?: unknown): Promise<T> {
      return request<T>('POST', path, { body });
    },
  };
}
