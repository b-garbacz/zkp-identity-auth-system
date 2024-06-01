'use client';

import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="en" className="bg-slate-950">
      <SessionProvider>
        <body className={inter.className}>
          <div id="app" className="z-50 relative">
            {children}
          </div>
          <div id="toast" className="fixed top-5 right-10 max-w-sm w-full z-50" />
          {(pathname === '/auth/register' || pathname === '/auth/login') && (
            <img src="/images/background.jpg" className="absolute top-0 object-cover left-0 w-full h-full opacity-10" />
          )}
        </body>
      </SessionProvider>
    </html>
  );
}
