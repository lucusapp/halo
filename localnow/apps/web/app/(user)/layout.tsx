import type { ReactNode } from 'react';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import { withBasePath } from '@/lib/base-path';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <Link href={withBasePath('/dashboard')} className="text-lg font-bold text-gray-900">
            LocalNow
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href={withBasePath('/dashboard')} className="text-gray-700 hover:underline">
              Mi cuenta
            </Link>
            <Link href={withBasePath('/tickets')} className="text-gray-700 hover:underline">
              Tickets
            </Link>
            <Link href={withBasePath('/puntos')} className="text-gray-700 hover:underline">
              Puntos
            </Link>
            <SignOutButton redirectUrl={withBasePath('/login')}>
              <button type="button" className="text-gray-400 hover:underline">
                Salir
              </button>
            </SignOutButton>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-xl px-4 py-6">{children}</div>
    </div>
  );
}
