import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

// Tipografía editorial: Playfair Display (serif) para titulares, DM Sans para el
// resto — next/font las autohospeda en build (sin layout shift, sin depender de
// Google Fonts en producción). Se exponen como variables CSS y se mapean a
// font-serif/font-sans en tailwind.config.ts.
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LocalNow',
  description: 'Revista local y directorio de comercio de tu ciudad',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" className={`${playfairDisplay.variable} ${dmSans.variable}`}>
        <body className="font-sans">{children}</body>
      </html>
    </ClerkProvider>
  );
}
