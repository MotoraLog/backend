import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

import { AppError } from '@/lib/errors';
import { signAccessToken, signRefreshToken, verifyToken } from '@/lib/jwt';
import { UserModel } from '@/models/User';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function issueAuthTokens(userId: string, email: string) {
  const accessToken = await signAccessToken({ sub: userId, email });
  const refreshToken = await signRefreshToken({ sub: userId, email });

  return { accessToken, refreshToken };
}

export async function getAuthenticatedUser() {
  const headersStore = await headers();
  const authorization = headersStore.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError('Missing or invalid Authorization header.', 401, 'UNAUTHORIZED');
  }

  const token = authorization.slice(7);
  const payload = await verifyToken(token);

  if (payload.type !== 'access') {
    throw new AppError('Invalid access token.', 401, 'INVALID_ACCESS_TOKEN');
  }

  const user = await UserModel.findById(payload.sub).lean();

  if (!user) {
    throw new AppError('User not found.', 401, 'USER_NOT_FOUND');
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name
  };
}
