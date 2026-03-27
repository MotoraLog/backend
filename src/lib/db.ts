import mongoose from 'mongoose';

import { getEnv } from '@/lib/env';

declare global {
  var mongooseConnectionPromise:
    | Promise<typeof mongoose>
    | undefined;
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!global.mongooseConnectionPromise) {
    global.mongooseConnectionPromise = mongoose.connect(getEnv().mongoUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000
    });
  }

  return global.mongooseConnectionPromise;
}
