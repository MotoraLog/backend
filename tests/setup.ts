import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

declare global {
  var __TEST_HEADERS__: Record<string, string> | undefined;
  var __MONGOD__: MongoMemoryServer | undefined;
}

vi.mock('next/headers', () => ({
  headers: async () => new Headers(globalThis.__TEST_HEADERS__ ?? {})
}));

beforeAll(async () => {
  globalThis.__MONGOD__ = await MongoMemoryServer.create();
  process.env.MONGODB_URI = globalThis.__MONGOD__.getUri();
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.ACCESS_TOKEN_TTL_MINUTES = '15';
  process.env.REFRESH_TOKEN_TTL_DAYS = '7';
  process.env.ALLOW_PUBLIC_REGISTRATION = 'true';
  process.env.APP_SETUP_TOKEN = 'test-setup-token';
});

afterEach(async () => {
  globalThis.__TEST_HEADERS__ = undefined;

  if (mongoose.connection.readyState === 1) {
    const collections = Object.values(mongoose.connection.collections);

    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  globalThis.__TEST_HEADERS__ = undefined;
  await mongoose.disconnect();
  global.mongooseConnectionPromise = undefined;
  await globalThis.__MONGOD__?.stop();
});
