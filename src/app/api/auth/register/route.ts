import { NextRequest } from 'next/server';

import { connectToDatabase } from '@/lib/db';
import { created, parseJson, withErrorHandling } from '@/lib/api';
import { hashPassword, issueAuthTokens } from '@/lib/auth';
import { getEnv } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { serializeUser } from '@/lib/serializers';
import { UserModel } from '@/models/User';
import { registerSchema } from '@/validators/auth';

export const POST = withErrorHandling(async (request: NextRequest) => {
  await connectToDatabase();

  const env = getEnv();
  if (!env.allowPublicRegistration) {
    if (!env.appSetupToken) {
      throw new AppError(
        'Registration is disabled and APP_SETUP_TOKEN is not configured.',
        500,
        'REGISTRATION_NOT_CONFIGURED'
      );
    }

    const setupTokenHeader = request.headers.get('x-app-setup-token');
    if (!setupTokenHeader || setupTokenHeader !== env.appSetupToken) {
      throw new AppError(
        'Registration is disabled. Provide a valid setup token.',
        403,
        'REGISTRATION_DISABLED'
      );
    }
  }

  const payload = await parseJson(request, registerSchema);
  const passwordHash = await hashPassword(payload.password);
  const user = await UserModel.create({
    email: payload.email.toLowerCase(),
    name: payload.name,
    passwordHash
  });

  const tokens = await issueAuthTokens(user._id.toString(), user.email);

  return created({
    user: serializeUser(user),
    tokens
  });
});
