import { NextRequest, NextResponse } from 'next/server';

import { getOpenApiDocument } from '@/lib/openapi';

export async function GET(request: NextRequest) {
  return NextResponse.json(getOpenApiDocument(request.nextUrl.origin), {
    headers: {
      'cache-control': 'public, max-age=0, must-revalidate'
    }
  });
}
