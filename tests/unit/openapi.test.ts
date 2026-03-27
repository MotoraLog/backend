import { getOpenApiDocument, getOpenApiEndpoints } from '@/lib/openapi';

describe('openapi helpers', () => {
  it('injects the current base URL into the generated document', () => {
    const document = getOpenApiDocument('https://example.com');

    expect(document.servers?.[0]).toEqual({
      url: 'https://example.com',
      description: 'Current environment'
    });
  });

  it('extracts endpoint summaries from the spec', () => {
    const endpoints = getOpenApiEndpoints();

    expect(endpoints.some((endpoint) => endpoint.path === '/api/vehicles' && endpoint.method === 'GET')).toBe(true);
    expect(endpoints.some((endpoint) => endpoint.path === '/api/auth/login' && endpoint.method === 'POST')).toBe(true);
  });

  it('keeps request and response examples for key endpoints', () => {
    const document = getOpenApiDocument();
    const registerOperation = document.paths['/api/auth/register'].post as any;
    const fuelOperation = document.paths['/api/vehicles/{vehicleId}/fuel-entries'].post as any;

    const registerExample = registerOperation?.requestBody?.content?.['application/json']?.examples?.default;
    const fuelResponseExample =
      fuelOperation?.responses?.['201']?.content?.['application/json']?.examples?.success;

    expect(registerExample).toBeTruthy();
    expect(fuelResponseExample).toBeTruthy();
  });
});
