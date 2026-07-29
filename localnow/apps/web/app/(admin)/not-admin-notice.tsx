// El alta de AdminUser es manual/interna (§10.3) — no hay autoservicio, así que a
// diferencia de CommerceNotRegisteredNotice/CompleteRegistrationForm aquí no hay
// ningún formulario que ofrecer, solo informar.
export function NotAdminNotice() {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Sin permisos de administrador</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Tu cuenta está autenticada pero no tiene rol de administrador en LocalNow. Contacta con el equipo si crees que
        deberías tener acceso.
      </p>
    </div>
  );
}
