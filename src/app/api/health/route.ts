import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'vehicle-maintenance-backend',
    timestamp: new Date().toISOString()
  });
}
