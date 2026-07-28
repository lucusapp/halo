// A diferencia del panel de usuario, aquí no hay un formulario de alta propio: darse
// de alta como comercio implica CIF, dirección, categoría… un flujo de onboarding
// completo (§9.1) que es una feature aparte, no parte de "construir las páginas del
// panel ya autenticado". Mientras tanto, este es el estado informativo.
export function CommerceNotRegisteredNotice() {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-lg font-bold text-gray-900">Esta cuenta no tiene un comercio asociado</h2>
      <p className="text-sm text-gray-600">
        Para gestionar un comercio en LocalNow necesitas completar el alta (nombre, CIF, dirección…) y que un
        administrador la apruebe. Contacta con soporte para darte de alta.
      </p>
    </div>
  );
}
