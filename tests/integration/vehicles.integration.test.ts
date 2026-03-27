import { GET as vehicleGet, POST as vehiclePost } from '@/app/api/vehicles/route';
import { GET as vehicleDetailGet } from '@/app/api/vehicles/[vehicleId]/route';
import { POST as registerPost } from '@/app/api/auth/register/route';

import { createJsonRequest, readJson, setAuthToken, vehicleContext } from '@/../tests/helpers/http';

async function registerUser(email: string) {
  const response = await registerPost(
    createJsonRequest('http://test/api/auth/register', 'POST', {
      name: 'Gilberto',
      email,
      password: 'supersecret123'
    })
  );

  const body = await readJson<{
    data: {
      tokens: { accessToken: string };
    };
  }>(response);

  return body.data.tokens.accessToken;
}

describe('vehicles integration', () => {
  it('paginates and filters vehicle lists', async () => {
    const accessToken = await registerUser('vehicles@example.com');
    setAuthToken(accessToken);

    const payloads = [
      { description: 'HB20', plate: 'AAA0001', category: 'car', currentOdometerKm: 1000 },
      { description: 'Civic Touring', plate: 'AAA0002', category: 'car', currentOdometerKm: 2000 },
      { description: 'CG 160', plate: 'AAA0003', category: 'motorcycle', currentOdometerKm: 3000 }
    ];

    for (const payload of payloads) {
      await vehiclePost(createJsonRequest('http://test/api/vehicles', 'POST', payload));
    }

    const response = await vehicleGet(
      createJsonRequest('http://test/api/vehicles?page=1&pageSize=2&search=car', 'GET')
    );

    expect(response.status).toBe(200);
    const body = await readJson<{
      data: { vehicles: Array<{ description: string }> };
      meta: { page: number; pageSize: number; totalItems: number; totalPages: number };
    }>(response);

    expect(body.meta).toEqual({ page: 1, pageSize: 2, totalItems: 2, totalPages: 1 });
    expect(body.data.vehicles.map((vehicle) => vehicle.description)).toEqual(['Civic Touring', 'HB20']);
  });

  it('prevents one user from reading another user vehicle', async () => {
    const ownerToken = await registerUser('owner@example.com');
    setAuthToken(ownerToken);

    const createResponse = await vehiclePost(
      createJsonRequest('http://test/api/vehicles', 'POST', {
        description: 'Owner Car',
        plate: 'BBB0001',
        category: 'car',
        currentOdometerKm: 1000
      })
    );

    const createBody = await readJson<{ data: { vehicle: { id: string } } }>(createResponse);

    const otherToken = await registerUser('other@example.com');
    setAuthToken(otherToken);

    const response = await vehicleDetailGet(
      createJsonRequest(`http://test/api/vehicles/${createBody.data.vehicle.id}`, 'GET'),
      vehicleContext(createBody.data.vehicle.id)
    );

    expect(response.status).toBe(404);
    const body = await readJson<{ error: { code: string } }>(response);
    expect(body.error.code).toBe('VEHICLE_NOT_FOUND');
  });
});
