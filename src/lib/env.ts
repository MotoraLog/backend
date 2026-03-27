import { AppError } from '@/lib/errors';

type EnvConfig = {
  mongoUri: string;
  jwtSecret: string;
  accessTokenTtlMinutes: number;
  refreshTokenTtlDays: number;
  allowPublicRegistration: boolean;
  appSetupToken?: string;
};

let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (cachedEnv) {
    return cachedEnv;
  }

  const mongoUri = process.env.MONGODB_URI;
  const jwtSecret = process.env.JWT_SECRET;
  const accessTokenTtlMinutes = Number(process.env.ACCESS_TOKEN_TTL_MINUTES ?? 15);
  const refreshTokenTtlDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7);
  const allowPublicRegistration = process.env.ALLOW_PUBLIC_REGISTRATION === 'true';
  const appSetupToken = process.env.APP_SETUP_TOKEN;

  if (!mongoUri) {
    throw new AppError('Missing MONGODB_URI environment variable.', 500);
  }

  if (!jwtSecret) {
    throw new AppError('Missing JWT_SECRET environment variable.', 500);
  }

  cachedEnv = {
    mongoUri,
    jwtSecret,
    accessTokenTtlMinutes,
    refreshTokenTtlDays,
    allowPublicRegistration,
    appSetupToken
  };

  return cachedEnv;
}
