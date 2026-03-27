import { NextRequest } from 'next/server';

export function createJsonRequest(url: string, method: string, body?: unknown) {
  return new NextRequest(url, {
    method,
    headers: {
      'content-type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
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
