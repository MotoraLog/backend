import { NextRequest } from 'next/server';

import { connectToDatabase } from '@/lib/db';
import { created, parseJson, withErrorHandling } from '@/lib/api';
import { hashPassword, issueAuthTokens } from '@/lib/auth';
import { serializeUser } from '@/lib/serializers';
import { UserModel } from '@/models/User';
import { registerSchema } from '@/validators/auth';

export const POST = withErrorHandling(async (request: NextRequest) => {
  await connectToDatabase();

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
