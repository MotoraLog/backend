import { NextRequest } from 'next/server';

export function createJsonRequest(
  url: string,
  method: string,
  body?: unknown,
  headers?: Record<string, string>
) {
  return new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(headers ?? {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
}

export function createRegisterRequest(url: string, body: unknown) {
  return createJsonRequest(url, 'POST', body, {
    'x-app-setup-token': process.env.APP_SETUP_TOKEN ?? ''
  });
}

export async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function setAuthToken(token?: string) {
  globalThis.__TEST_HEADERS__ = token ? { authorization: `Bearer ${token}` } : {};
}

export function vehicleContext(vehicleId: string) {
  return {
    params: Promise.resolve({ vehicleId })
  };
}
