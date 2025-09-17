import { NextResponse } from 'next/server';

type Event = {
  id: string;
  title: string;
  date: string;
  summary: string;
};

const events: Event[] = [
  {
    id: 'microsite-event-open-house',
    title: 'Campus Open House',
    date: '2025-03-15',
    summary: 'Meet our teachers, explore classrooms, and enjoy family activities.',
  },
  {
    id: 'microsite-event-family-night',
    title: 'Family Literacy Night',
    date: '2025-04-10',
    summary: 'Join us for stories, crafts, and tips to support reading at home.',
  },
];

export async function GET() {
  return NextResponse.json(events);
}
