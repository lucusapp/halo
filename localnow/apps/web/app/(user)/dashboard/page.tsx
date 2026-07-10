import { auth, currentUser } from '@clerk/nextjs/server';
import { SignOutButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { withBasePath } from '@/lib/base-path';

// Página de prueba: el middleware ya exige sesión para /dashboard, pero se repite la
// comprobación aquí porque es la forma recomendada por Clerk de acceder a los datos de
// auth en un Server Component (auth() no protege por sí solo, solo informa).
export default async function DashboardPage() {
  const { userId, getToken } = await auth();
  if (!userId) {
    redirect(withBasePath('/login'));
  }

  const user = await currentUser();
  // JWT de sesión de Clerk — pégalo en `Authorization: Bearer <token>` para probar
  // los endpoints de packages/api/src/auth (POST /auth/login, /auth/register/user...).
  // Es un token de sesión real de corta duración: no lo compartas ni lo commitees.
  const sessionToken = await getToken();

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Mi cuenta</h1>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="font-medium text-gray-500">Clerk user ID</dt>
        <dd className="break-all">{userId}</dd>
        <dt className="font-medium text-gray-500">Email</dt>
        <dd>{user?.primaryEmailAddress?.emailAddress ?? '—'}</dd>
        <dt className="font-medium text-gray-500">Nombre</dt>
        <dd>{user?.fullName ?? '—'}</dd>
      </dl>

      <div>
        <p className="mb-1 text-sm font-medium text-gray-500">
          JWT de sesión (para probar el backend NestJS)
        </p>
        <textarea
          readOnly
          value={sessionToken ?? ''}
          rows={6}
          className="w-full rounded border border-gray-300 p-2 font-mono text-xs"
        />
      </div>

      <SignOutButton redirectUrl={withBasePath('/login')}>
        <button type="button" className="w-fit rounded bg-gray-900 px-4 py-2 text-sm text-white">
          Cerrar sesión
        </button>
      </SignOutButton>
    </main>
  );
}
