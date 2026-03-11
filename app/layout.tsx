import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'CreatorKit',
  description: 'All-in-one Instagram creator toolkit.'
};

const links = [
  { href: '/home', label: 'Home' },
  { href: '/carousel', label: 'Carousel' },
  { href: '/square', label: 'Square Fit' },
  { href: '/split', label: 'Splitter' },
  { href: '/editor', label: 'Editor' }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-8 flex items-center justify-between">
            <Link href="/home" className="text-xl font-semibold text-white">
              CreatorKit
            </Link>
            <nav className="flex gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
