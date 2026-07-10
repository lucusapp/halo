import Link from 'next/link';
import { withBasePath } from '@/lib/base-path';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">LocalNow</h1>
      <nav className="flex gap-4 text-sm underline">
        <Link href={withBasePath('/login')}>Iniciar sesión</Link>
        <Link href={withBasePath('/register')}>Crear cuenta</Link>
        <Link href={withBasePath('/dashboard')}>Mi cuenta</Link>
      </nav>
    </main>
  );
}
