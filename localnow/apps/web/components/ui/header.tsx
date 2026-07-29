import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { withBasePath } from '@/lib/base-path';

export async function Header({ cityName }: { cityName: string | null }) {
  const { userId } = await auth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href={withBasePath('/')} className="flex items-baseline gap-2">
          <span className="font-serif text-xl font-bold text-gray-900">LocalNow</span>
          {cityName ? <span className="text-sm text-gray-400">{cityName}</span> : null}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href={withBasePath('/')} className="text-gray-700 hover:underline">
            Noticias
          </Link>
          <Link href={withBasePath('/comercios')} className="text-gray-700 hover:underline">
            Comercios
          </Link>
          {userId ? (
            <Link href={withBasePath('/dashboard')} className="text-gray-700 hover:underline">
              Mi cuenta
            </Link>
          ) : (
            <Link href={withBasePath('/login')} className="text-gray-400 hover:underline">
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
