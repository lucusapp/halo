import type { ReactNode } from 'react';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';

// Vista pensada para tablet en el mostrador (§enunciado de esta fase): nav horizontal
// simple, sin sidebar — igual de usable en una pantalla estrecha que en una ancha.
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href={'/panel'} className="text-lg font-bold text-gray-900">
            LocalNow · Comercio
          </Link>
          <SignOutButton redirectUrl={'/login'}>
            <button type="button" className="text-sm text-gray-400 hover:underline">
              Salir
            </button>
          </SignOutButton>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
          <Link href={'/panel'} className="whitespace-nowrap rounded-full px-3 py-1.5 text-gray-700 hover:bg-gray-100">
            Resumen
          </Link>
          <Link
            href={'/panel/venta'}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-gray-700 hover:bg-gray-100"
          >
            Nueva venta
          </Link>
          <Link
            href={'/panel/cupones'}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-gray-700 hover:bg-gray-100"
          >
            Cupones
          </Link>
          <Link
            href={'/panel/productos'}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-gray-700 hover:bg-gray-100"
          >
            Productos
          </Link>
        </nav>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
    </div>
  );
}
