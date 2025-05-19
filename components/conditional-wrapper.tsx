'use client';

import { usePathname } from 'next/navigation';
import PageWrapper from './page-wrapper';

interface ConditionalWrapperProps {
  children: React.ReactNode;
}

export default function ConditionalWrapper({ children }: ConditionalWrapperProps) {
  const pathname = usePathname();
  
  // Don't apply loading animation to League pages
  if (pathname.startsWith('/league')) {
    return <>{children}</>;
  }
  
  return <PageWrapper>{children}</PageWrapper>;
}