import { PageShell } from '../../../components/layouts/PageShell';
import Head from 'next/head';

interface CenterDetailProps {
  params: Promise<{ id: string }>;
}

export default async function CenterDetail({ params }: CenterDetailProps) {
  const { id } = await params;
  const center = {
    id,
    name: 'KinderCare Capitol Hill',
    address: '123 Pine St, Seattle, WA 98102',
    phone: '+1-206-555-0100',
    hours: 'Mon-Fri 7:00 AM - 6:00 PM',
    geo: { lat: 47.62, lng: -122.319 },
  };

  return (
    <PageShell>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ChildCare',
              name: center.name,
              address: {
                '@type': 'PostalAddress',
                streetAddress: center.address.split(',')[0],
                addressLocality: center.address.split(',')[1].trim(),
                addressRegion: center.address
                  .split(',')[2]
                  .trim()
                  .split(' ')[0],
                postalCode: center.address.split(',')[2].trim().split(' ')[1],
              },
              telephone: center.phone,
              openingHours: center.hours
                .replace('Mon-Fri ', '')
                .replace(' - ', '-'),
              geo: {
                '@type': 'GeoCoordinates',
                latitude: center.geo.lat,
                longitude: center.geo.lng,
              },
            }),
          }}
        />
      </Head>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">{center.name}</h1>
        <p className="mb-2">
          <strong>Address:</strong> {center.address}
        </p>
        <p className="mb-2">
          <strong>Phone:</strong> {center.phone}
        </p>
        <p className="mb-2">
          <strong>Hours:</strong> {center.hours}
        </p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Call Now
        </button>
      </div>
    </PageShell>
  );
}
