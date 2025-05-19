'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on League pages
  if (pathname.startsWith('/league')) {
    return null;
  }
  
  return <Footer />;
}