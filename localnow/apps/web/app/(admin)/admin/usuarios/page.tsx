import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { authFetch, isNotAdmin } from '@/lib/auth-api';
import type { AdminUser } from '@/lib/types';
import { NotAdminNotice } from '../../not-admin-notice';

export default async function AdminUsuariosPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/login');
  }

  let users: AdminUser[];
  try {
    users = await authFetch<AdminUser[]>('/admin/users');
  } catch (error) {
    if (isNotAdmin(error)) {
      return <NotAdminNotice />;
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Usuarios ({users.length})</h1>

      {users.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no hay usuarios registrados.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-700 dark:text-gray-500">
                <th className="p-3 font-medium">Nombre</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Ciudad</th>
                <th className="p-3 text-right font-medium">Puntos globales</th>
                <th className="p-3 text-right font-medium">Alta</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                  <td className="p-3 text-gray-900 dark:text-gray-100">{user.name ?? '—'}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{user.cityName ?? '—'}</td>
                  <td className="p-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    {user.pointsGlobalBalance}
                  </td>
                  <td className="p-3 text-right text-gray-400 dark:text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
