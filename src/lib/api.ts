import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

import { AppError, isAppError } from '@/lib/errors';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function okWithMeta<T, M>(data: T, meta: M, status = 200) {
  return NextResponse.json({ data, meta }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export async function parseJson<T>(request: NextRequest, schema: ZodSchema<T>) {
  const payload = await request.json();
  return schema.parse(payload);
}

export function parseQuery<T>(request: NextRequest, schema: ZodSchema<T>) {
  const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  return schema.parse(rawParams);
}

export function handleApiError(error: unknown) {
  if (isAppError(error)) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error.details ?? null
        }
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error && error.name === 'MongooseServerSelectionError') {
    return NextResponse.json(
      {
        error: {
          message: 'Database connection failed. Check MONGODB_URI and network access.',
          code: 'DB_UNAVAILABLE',
          details: null
        }
      },
      { status: 503 }
    );
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'MongoServerError' &&
    'code' in error &&
    (error as { code?: number }).code === 13
  ) {
    return NextResponse.json(
      {
        error: {
          message: 'Database authorization failed. Check database user permissions and DB name in MONGODB_URI.',
          code: 'DB_AUTH_FAILED',
          details: null
        }
      },
      { status: 500 }
    );
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  ) {
    return NextResponse.json(
      {
        error: {
          message: 'A unique field already exists.',
          code: 'DUPLICATE_KEY',
          details: null
        }
      },
      { status: 409 }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          message: 'Validation failed.',
          code: 'VALIDATION_ERROR',
          details: error.flatten()
        }
      },
      { status: 422 }
    );
  }

  return NextResponse.json(
    {
      error: {
        message: 'Internal server error.',
        code: 'INTERNAL_SERVER_ERROR',
        details: null
      }
    },
    { status: 500 }
  );
}

export function withErrorHandling<T extends Array<unknown>>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export function assertFound<T>(value: T | null, message: string) {
  if (!value) {
    throw new AppError(message, 404, 'NOT_FOUND');
  }

  return value;
}

export function getPaginationMeta(page: number, pageSize: number, totalItems: number) {
  return {
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize))
  };
}
