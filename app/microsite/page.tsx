import { cache } from 'react';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layouts/PageShell';
import { renderPlaceholder } from '@/lib/sitecore/rendering';
import { buildMicrositeLayout, MicrositeLayout } from '@/data/microsite/layout';
import { ConsentBanner } from '@/components/organisms/ConsentBanner';
import { AnnouncementBar } from '@/components/organisms/AnnouncementBar';

const getLayoutData = cache(
  async (): Promise<MicrositeLayout> => buildMicrositeLayout()
);

export default async function MicrositePage() {
  const layout = await getLayoutData();
  const route = layout.sitecore.route;

  if (!route) {
    notFound();
  }

  const mainPlaceholder = route.placeholders?.['jss-main'];

  return (
    <div>
      <h1>Microsite</h1>
      <p>Server-side rendered successfully!</p>
      <ConsentBanner />
      {mainPlaceholder && renderPlaceholder('jss-main', mainPlaceholder)}
    </div>
  );
}
