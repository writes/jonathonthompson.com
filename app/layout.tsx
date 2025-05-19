import Navigation from '@/components/navigation';
import './globals.css';
import { Inter } from 'next/font/google';
import ActiveSectionContextProvider from '@/context/active-section-context';
import ConditionalFooter from '@/components/conditional-footer';
import ThemeSwitch from '@/components/theme-switch';
import ThemeContextProvider from '@/context/theme-context';
import { Toaster } from 'react-hot-toast';
import ConditionalWrapper from '@/components/conditional-wrapper';
import ConditionalBackground from '@/components/conditional-background';
import Providers from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Jonathon | Personal Portfolio',
  description:
    'Jonathon is a Full Stack Developer with 10 years of experience.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="!scroll-smooth">
      <body
        className={`${inter.className} bg-gray-50 text-gray-950 relative pt-28 sm:pt-36 dark:bg-gray-900 dark:text-gray-50 dark:text-opacity-90`}
      >
        <ConditionalBackground />

        <Providers>
          <ThemeContextProvider>
            <ActiveSectionContextProvider>
              <ConditionalWrapper>
                <Navigation />
                {children}
                <ConditionalFooter />

                <Toaster position="top-right" />
                <ThemeSwitch />
              </ConditionalWrapper>
            </ActiveSectionContextProvider>
          </ThemeContextProvider>
        </Providers>
      </body>
    </html>
  );
}
