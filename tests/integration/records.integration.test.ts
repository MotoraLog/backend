import { POST as registerPost } from '@/app/api/auth/register/route';
import { POST as vehiclePost } from '@/app/api/vehicles/route';
import { POST as odometerPost } from '@/app/api/vehicles/[vehicleId]/odometer/route';
import { GET as fuelGet, POST as fuelPost } from '@/app/api/vehicles/[vehicleId]/fuel-entries/route';
import {
  GET as maintenanceGet,
  POST as maintenancePost
} from '@/app/api/vehicles/[vehicleId]/maintenance-entries/route';
import { GET as remindersGet, POST as remindersPost } from '@/app/api/vehicles/[vehicleId]/reminders/route';

import { createJsonRequest, readJson, setAuthToken, vehicleContext } from '@/../tests/helpers/http';

async function createAuthorizedVehicle() {
  const registerResponse = await registerPost(
    createJsonRequest('http://test/api/auth/register', 'POST', {
      name: 'Gilberto',
      email: 'records@example.com',
      password: 'supersecret123'
    })
  );

  const registerBody = await readJson<{
    data: { tokens: { accessToken: string } };
  }>(registerResponse);

  setAuthToken(registerBody.data.tokens.accessToken);

  const vehicleResponse = await vehiclePost(
    createJsonRequest('http://test/api/vehicles', 'POST', {
      description: 'Civic',
      plate: 'CCC0001',
      category: 'car',
      currentOdometerKm: 10000
    })
  );

  const vehicleBody = await readJson<{ data: { vehicle: { id: string } } }>(vehicleResponse);

  return vehicleBody.data.vehicle.id;
}

describe('fuel, maintenance, and reminder integration', () => {
  it('calculates fuel totals, paginates maintenance, and filters due reminders', async () => {
    const vehicleId = await createAuthorizedVehicle();

    const firstFuelResponse = await fuelPost(
      createJsonRequest(`http://test/api/vehicles/${vehicleId}/fuel-entries`, 'POST', {
        odometerKm: 10200,
        unitPrice: 5.49,
        fuelType: 'Gasolina Comum',
        quantity: 10,
        totalPrice: 1,
        notes: 'posto A',
        recordedAt: '2026-03-20T10:00:00.000Z'
      }),
      vehicleContext(vehicleId)
    );

    expect(firstFuelResponse.status).toBe(201);
    const firstFuelBody = await readJson<{
      data: { fuelEntry: { totalPrice: number } };
    }>(firstFuelResponse);
    expect(firstFuelBody.data.fuelEntry.totalPrice).toBe(54.9);

    await fuelPost(
      createJsonRequest(`http://test/api/vehicles/${vehicleId}/fuel-entries`, 'POST', {
        odometerKm: 10400,
        unitPrice: 4.39,
        fuelType: 'Etanol',
        quantity: 20,
        recordedAt: '2026-03-21T10:00:00.000Z'
      }),
      vehicleContext(vehicleId)
    );

    const fuelListResponse = await fuelGet(
      createJsonRequest(
        `http://test/api/vehicles/${vehicleId}/fuel-entries?page=1&pageSize=1&fuelType=Gasolina`,
        'GET'
      ),
      vehicleContext(vehicleId)
    );

    const fuelListBody = await readJson<{
      data: { fuelEntries: Array<{ fuelType: string }> };
      meta: { totalItems: number; pageSize: number };
    }>(fuelListResponse);
    expect(fuelListBody.meta.totalItems).toBe(1);
    expect(fuelListBody.meta.pageSize).toBe(1);
    expect(fuelListBody.data.fuelEntries[0]?.fuelType).toBe('Gasolina Comum');

    await maintenancePost(
      createJsonRequest(`http://test/api/vehicles/${vehicleId}/maintenance-entries`, 'POST', {
        maintenanceType: 'oil and filter',
        notes: 'first'
      }),
      vehicleContext(vehicleId)
    );

    await maintenancePost(
      createJsonRequest(`http://test/api/vehicles/${vehicleId}/maintenance-entries`, 'POST', {
        maintenanceType: 'tires',
        notes: 'second'
      }),
      vehicleContext(vehicleId)
    );

    const maintenanceResponse = await maintenanceGet(
      createJsonRequest(
        `http://test/api/vehicles/${vehicleId}/maintenance-entries?page=1&pageSize=1&maintenanceType=tire`,
        'GET'
      ),
      vehicleContext(vehicleId)
    );

    const maintenanceBody = await readJson<{
      data: { maintenanceEntries: Array<{ maintenanceType: string }> };
      meta: { totalItems: number; totalPages: number };
    }>(maintenanceResponse);
    expect(maintenanceBody.meta.totalItems).toBe(1);
    expect(maintenanceBody.meta.totalPages).toBe(1);
    expect(maintenanceBody.data.maintenanceEntries[0]?.maintenanceType).toBe('tires');

    await remindersPost(
      createJsonRequest(`http://test/api/vehicles/${vehicleId}/reminders`, 'POST', {
        reminderText: 'trocar oleo',
        mileageIntervalKm: 100
      }),
      vehicleContext(vehicleId)
    );

    await remindersPost(
      createJsonRequest(`http://test/api/vehicles/${vehicleId}/reminders`, 'POST', {
        reminderText: 'pastilha de freio',
        remindAtOdometerKm: 10300
      }),
      vehicleContext(vehicleId)
    );

    await odometerPost(
      createJsonRequest(`http://test/api/vehicles/${vehicleId}/odometer`, 'POST', {
        odometerKm: 10600,
        recordedAt: '2026-03-22T10:00:00.000Z'
      }),
      vehicleContext(vehicleId)
    );

    const remindersResponse = await remindersGet(
      createJsonRequest(`http://test/api/vehicles/${vehicleId}/reminders?page=1&pageSize=10&due=true`, 'GET'),
      vehicleContext(vehicleId)
    );

    const remindersBody = await readJson<{
      data: { reminders: Array<{ dueState: { isDue: boolean } }> };
      meta: { totalItems: number };
    }>(remindersResponse);
    expect(remindersBody.meta.totalItems).toBe(2);
    expect(remindersBody.data.reminders.every((reminder) => reminder.dueState.isDue)).toBe(true);
  });
});
