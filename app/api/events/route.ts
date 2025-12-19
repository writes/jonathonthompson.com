import { NextResponse } from 'next/server';
import { events } from '@/data/microsite/events';

export async function GET() {
  return NextResponse.json(events);
}
