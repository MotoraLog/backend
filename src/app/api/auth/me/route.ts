import { getAuthenticatedUser } from '@/lib/auth';
import { ok, withErrorHandling } from '@/lib/api';
import { connectToDatabase } from '@/lib/db';

export const GET = withErrorHandling(async () => {
  await connectToDatabase();
  const user = await getAuthenticatedUser();
  return ok({ user });
});
