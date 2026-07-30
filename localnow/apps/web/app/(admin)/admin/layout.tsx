import type { ReactNode } from 'react';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import { withBasePath } from '@/lib/base-path';

const NAV_ITEMS = [
  { href: '/admin', label: 'Visión general' },
  { href: '/admin/comercios', label: 'Comercios' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/noticias', label: 'Noticias' },
  { href: '/admin/cupones', label: 'Cupones' },
  { href: '/admin/segmentos', label: 'Segmentos' },
  { href: '/admin/promociones', label: 'Promociones' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/admin/configuracion', label: 'Configuración' },
];

// Sidebar fija en escritorio (md+, herramienta de gestión pensada para pantalla
// grande) que se convierte en barra horizontal desplazable en móvil — mismo <nav>,
// solo cambia flex-row/flex-col por breakpoint.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950 md:flex-row">
      <aside className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-3 md:flex-col md:items-start md:gap-4">
          <Link href={withBasePath('/admin')} className="text-lg font-bold text-gray-900 dark:text-gray-100">
            LocalNow Admin
          </Link>
          <SignOutButton redirectUrl={withBasePath('/login')}>
            <button type="button" className="text-sm text-gray-400 hover:underline md:hidden">
              Salir
            </button>
          </SignOutButton>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:gap-0.5 md:overflow-visible md:px-2 md:pb-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={withBasePath(item.href)}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-4 pb-4 md:block">
          <SignOutButton redirectUrl={withBasePath('/login')}>
            <button type="button" className="text-sm text-gray-400 hover:underline">
              Salir
            </button>
          </SignOutButton>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
