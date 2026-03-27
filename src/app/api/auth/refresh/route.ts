import { NextRequest } from 'next/server';

import { created, parseJson, withErrorHandling } from '@/lib/api';
import { connectToDatabase } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { verifyToken } from '@/lib/jwt';
import { issueAuthTokens } from '@/lib/auth';
import { serializeUser } from '@/lib/serializers';
import { UserModel } from '@/models/User';
import { refreshTokenSchema } from '@/validators/auth';

export const POST = withErrorHandling(async (request: NextRequest) => {
  await connectToDatabase();

  const payload = await parseJson(request, refreshTokenSchema);
  const tokenPayload = await verifyToken(payload.refreshToken);

  if (tokenPayload.type !== 'refresh') {
    throw new AppError('Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
  }

  const user = await UserModel.findById(tokenPayload.sub);

  if (!user) {
    throw new AppError('User not found.', 401, 'USER_NOT_FOUND');
  }

  const tokens = await issueAuthTokens(user._id.toString(), user.email);

  return created({
    user: serializeUser(user),
    tokens
  });
});
