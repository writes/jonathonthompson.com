import { NextResponse } from 'next/server';
import { buildMicrositeLayout } from '@/data/microsite/layout';

export async function GET() {
  return NextResponse.json(buildMicrositeLayout());
}
