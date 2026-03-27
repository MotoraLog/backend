import { GET as meGet } from '@/app/api/auth/me/route';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { POST as refreshPost } from '@/app/api/auth/refresh/route';
import { POST as registerPost } from '@/app/api/auth/register/route';

import { createJsonRequest, createRegisterRequest, readJson, setAuthToken } from '@/../tests/helpers/http';

describe('auth integration', () => {
  it('registers, reads current user, and refreshes tokens', async () => {
    const registerResponse = await registerPost(
      createRegisterRequest('http://test/api/auth/register', {
        name: 'Gilberto',
        email: 'USER@example.com',
        password: 'supersecret123'
      })
    );

    expect(registerResponse.status).toBe(201);
    const registerBody = await readJson<{
      data: {
        user: { email: string; name: string };
        tokens: { accessToken: string; refreshToken: string };
      };
    }>(registerResponse);

    expect(registerBody.data.user.email).toBe('user@example.com');
    setAuthToken(registerBody.data.tokens.accessToken);

    const meResponse = await meGet();
    expect(meResponse.status).toBe(200);

    const meBody = await readJson<{ data: { user: { email: string; name: string } } }>(meResponse);
    expect(meBody.data.user.name).toBe('Gilberto');

    const refreshResponse = await refreshPost(
      createJsonRequest('http://test/api/auth/refresh', 'POST', {
        refreshToken: registerBody.data.tokens.refreshToken
      })
    );

    expect(refreshResponse.status).toBe(201);
    const refreshBody = await readJson<{
      data: { tokens: { accessToken: string; refreshToken: string } };
    }>(refreshResponse);

    expect(refreshBody.data.tokens.accessToken).toBeTruthy();
    expect(refreshBody.data.tokens.refreshToken).toBeTruthy();
  });

  it('returns structured errors for duplicate registration and invalid login', async () => {
    await registerPost(
      createRegisterRequest('http://test/api/auth/register', {
        name: 'Gilberto',
        email: 'user@example.com',
        password: 'supersecret123'
      })
    );

    const duplicateResponse = await registerPost(
      createRegisterRequest('http://test/api/auth/register', {
        name: 'Gilberto',
        email: 'user@example.com',
        password: 'supersecret123'
      })
    );

    expect(duplicateResponse.status).toBe(409);
    const duplicateBody = await readJson<{ error: { code: string } }>(duplicateResponse);
    expect(duplicateBody.error.code).toBe('DUPLICATE_KEY');

    const loginResponse = await loginPost(
      createJsonRequest('http://test/api/auth/login', 'POST', {
        email: 'user@example.com',
        password: 'wrongpassword'
      })
    );

    expect(loginResponse.status).toBe(401);
    const loginBody = await readJson<{ error: { code: string } }>(loginResponse);
    expect(loginBody.error.code).toBe('INVALID_CREDENTIALS');
  });
});
