import Link from 'next/link';
import { withBasePath } from '@/lib/base-path';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href={withBasePath('/')} className="text-lg font-bold text-gray-900">
          LocalNow
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href={withBasePath('/')} className="text-gray-700 hover:underline">
            Noticias
          </Link>
          <Link href={withBasePath('/comercios')} className="text-gray-700 hover:underline">
            Comercios
          </Link>
          <Link href={withBasePath('/login')} className="text-gray-400 hover:underline">
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
}
