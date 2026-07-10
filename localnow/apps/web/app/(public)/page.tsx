import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">LocalNow</h1>
      <nav className="flex gap-4 text-sm underline">
        <Link href="/login">Iniciar sesión</Link>
        <Link href="/register">Crear cuenta</Link>
        <Link href="/dashboard">Mi cuenta</Link>
      </nav>
    </main>
  );
}
