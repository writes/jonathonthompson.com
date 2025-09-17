'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { Icon } from '../atoms/Icon';

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/microsite' },
    { name: 'Programs', href: '/programs' },
    { name: 'Centers', href: '/microsite' },
    { name: 'Calendar', href: '/calendar' },
    { name: 'Policies', href: '/policies' },
    { name: 'Contact', href: '/microsite' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      <header className="bg-blue-600 text-white shadow-lg">
        <nav className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/microsite" className="text-2xl font-bold">
              KinderCare
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="hover:text-blue-200 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <Icon name={isMobileMenuOpen ? 'close' : 'menu'} />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-blue-500">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 hover:bg-blue-700 rounded transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main id="main-content" className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">KinderCare</h3>
              <p className="text-gray-300 text-sm">
                Providing quality childcare and early education for families since 1969.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/programs" className="text-gray-300 hover:text-white">Programs</Link></li>
                <li><Link href="/calendar" className="text-gray-300 hover:text-white">Calendar</Link></li>
                <li><Link href="/policies" className="text-gray-300 hover:text-white">Policies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>1-800-KINDERCARE</li>
                <li>info@kindercare.com</li>
                <li>Mon-Fri 8AM-6PM</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white" aria-label="Facebook">
                  <Icon name="facebook" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white" aria-label="Twitter">
                  <Icon name="twitter" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white" aria-label="Instagram">
                  <Icon name="instagram" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 KinderCare Education LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
