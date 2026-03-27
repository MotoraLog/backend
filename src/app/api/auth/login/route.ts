import { NextRequest } from 'next/server';

import { comparePassword, issueAuthTokens } from '@/lib/auth';
import { created, parseJson, withErrorHandling } from '@/lib/api';
import { connectToDatabase } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { serializeUser } from '@/lib/serializers';
import { UserModel } from '@/models/User';
import { loginSchema } from '@/validators/auth';

export const POST = withErrorHandling(async (request: NextRequest) => {
  await connectToDatabase();

  const payload = await parseJson(request, loginSchema);
  const user = await UserModel.findOne({ email: payload.email.toLowerCase() });

  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const passwordMatches = await comparePassword(payload.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = await issueAuthTokens(user._id.toString(), user.email);

  return created({
    user: serializeUser(user),
    tokens
  });
});
