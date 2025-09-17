import { NextRequest, NextResponse } from 'next/server';

type Center = {
  id: string;
  name: string;
  distance?: number;
  address: string;
  lat: number;
  lng: number;
};

const sampleCenters: Center[] = [
  {
    id: '1',
    name: 'KinderCare Capitol Hill',
    address: '123 Pine St, Seattle, WA 98102',
    lat: 47.62,
    lng: -122.319,
  },
  {
    id: '2',
    name: 'KinderCare Downtown',
    address: '456 Oak Ave, Seattle, WA 98101',
    lat: 47.609,
    lng: -122.333,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  if (!zip) {
    return NextResponse.json([]);
  }

  const filtered = sampleCenters.filter((c) => zip.startsWith('981'));

  return NextResponse.json(filtered);
}
