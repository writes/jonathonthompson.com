'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { links } from '@/lib/data';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useActiveSectionContext } from '@/context/active-section-context';
import { HiMenuAlt3, HiX, HiUser } from 'react-icons/hi';
import { useSession } from 'next-auth/react';

export default function Navigation() {
  const pathname = usePathname();
  const { activeSection, setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  
  // Determine if we're on the main page or a subpage
  const isMainPage = pathname === '/';
  const isLeaguePage = pathname.startsWith('/league');
  
  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLinkClick = (link: typeof links[number]) => {
    if (link.hash.startsWith('#')) {
      // For anchor links
      if (isMainPage) {
        // If on main page, just set active section for smooth scroll
        setActiveSection(link.name);
        setTimeOfLastClick(Date.now());
      } else {
        // If not on main page, navigate to main page with hash
        window.location.href = '/' + link.hash;
      }
    }
    // For route links, Next.js Link component handles navigation
    setMobileMenuOpen(false);
  };

  const isActiveLink = (link: typeof links[number]) => {
    if (link.hash.startsWith('/')) {
      return pathname.startsWith(link.hash);
    }
    return isMainPage && activeSection === link.name;
  };

  return (
    <header className="z-[999] relative">
      {/* Background */}
      <motion.div
        className="fixed top-0 left-1/2 h-[4.5rem] w-full rounded-none border border-white border-opacity-40 bg-white bg-opacity-80 shadow-lg shadow-black/[0.03] backdrop-blur-[0.5rem] sm:top-6 sm:h-[3.25rem] sm:w-[42rem] sm:rounded-full dark:bg-gray-950 dark:border-black/40 dark:bg-opacity-75"
        initial={{ y: -100, x: '-50%', opacity: 0 }}
        animate={{ y: 0, x: '-50%', opacity: 1 }}
      />

      {/* Desktop Navigation */}
      <nav className="hidden sm:flex fixed top-[0.15rem] left-1/2 h-12 -translate-x-1/2 py-2 sm:top-[1.7rem] sm:h-[initial] sm:py-0">
        <ul className="flex items-center justify-center gap-y-1 text-[0.9rem] font-medium text-gray-500 sm:flex-nowrap sm:gap-3">
          {links.map((link, index) => (
            <motion.li
              className="h-3/4 flex items-center justify-center relative"
              key={link.hash}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              {link.hash.startsWith('#') && !isMainPage ? (
                // Use regular anchor tag for navigation to main page with hash
                <a
                  className={clsx(
                    'flex w-full items-center justify-center px-3 py-3 hover:text-gray-950 transition dark:text-gray-500 dark:hover:text-gray-300',
                    {
                      'text-gray-950 dark:text-gray-200': isActiveLink(link),
                    }
                  )}
                  href={'/' + link.hash}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}

                  {isActiveLink(link) && (
                    <motion.span
                      className="bg-gray-100 rounded-full absolute inset-0 -z-10 dark:bg-gray-800"
                      layoutId="activeSection"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </a>
              ) : (
                // Use Next.js Link for main page anchors and routes
                <Link
                  className={clsx(
                    'flex w-full items-center justify-center px-3 py-3 hover:text-gray-950 transition dark:text-gray-500 dark:hover:text-gray-300',
                    {
                      'text-gray-950 dark:text-gray-200': isActiveLink(link),
                    }
                  )}
                  href={link.hash}
                  onClick={() => handleLinkClick(link)}
                >
                  {link.name}

                  {isActiveLink(link) && (
                    <motion.span
                      className="bg-gray-100 rounded-full absolute inset-0 -z-10 dark:bg-gray-800"
                      layoutId="activeSection"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              )}
            </motion.li>
          ))}
          
          {/* Profile button */}
          {session && (
            <motion.li
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="ml-4"
            >
              <Link
                href="/profile"
                className={clsx(
                  'flex items-center justify-center p-2 hover:text-gray-950 transition dark:text-gray-500 dark:hover:text-gray-300 rounded-full',
                  {
                    'text-gray-950 dark:text-gray-200 bg-gray-100 dark:bg-gray-800': pathname === '/profile',
                  }
                )}
                title="Profile"
              >
                <HiUser className="w-5 h-5" />
              </Link>
            </motion.li>
          )}
        </ul>
      </nav>

      {/* Mobile Navigation */}
      <div className="sm:hidden fixed top-4 right-4">
        <motion.button
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 rounded-lg shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          {mobileMenuOpen ? (
            <HiX className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          ) : (
            <HiMenuAlt3 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          )}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="sm:hidden fixed inset-0 z-[998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu */}
            <motion.nav
              className="absolute top-20 left-4 right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-h-[calc(100vh-6rem)] overflow-y-auto"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <motion.li
                    key={link.hash}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    {link.hash.startsWith('#') && !isMainPage ? (
                      // Use regular anchor tag for navigation to main page with hash
                      <a
                        className={clsx(
                          'block px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition',
                          {
                            'bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-gray-200': isActiveLink(link),
                            'text-gray-700 dark:text-gray-300': !isActiveLink(link),
                          }
                        )}
                        href={'/' + link.hash}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </a>
                    ) : (
                      // Use Next.js Link for main page anchors and routes
                      <Link
                        className={clsx(
                          'block px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition',
                          {
                            'bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-gray-200': isActiveLink(link),
                            'text-gray-700 dark:text-gray-300': !isActiveLink(link),
                          }
                        )}
                        href={link.hash}
                        onClick={() => handleLinkClick(link)}
                      >
                        {link.name}
                      </Link>
                    )}
                  </motion.li>
                ))}
                
                {/* Profile link in mobile menu */}
                {session && (
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * (links.length + 1) }}
                  >
                    <Link
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition',
                        {
                          'bg-gray-100 dark:bg-gray-800 text-gray-950 dark:text-gray-200': pathname === '/profile',
                          'text-gray-700 dark:text-gray-300': pathname !== '/profile',
                        }
                      )}
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <HiUser className="w-5 h-5" />
                      Profile
                    </Link>
                  </motion.li>
                )}
              </ul>

              {/* Current location indicator */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current: {isLeaguePage ? 'League Stats' : pathname === '/profile' ? 'Profile' : 'Portfolio'}
                </p>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}