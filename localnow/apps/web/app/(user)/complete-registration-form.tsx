import { completeRegistration } from './actions';

export function CompleteRegistrationForm() {
  return (
    <form
      action={completeRegistration}
      className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
    >
      <div>
        <h2 className="text-lg font-bold text-gray-900">Completa tu perfil</h2>
        <p className="mt-1 text-sm text-gray-600">
          Antes de ver tus puntos y tickets necesitamos tu consentimiento para tratar los datos de tus compras.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Nombre (opcional)
        <input
          type="text"
          name="name"
          maxLength={120}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" name="consentDataUsage" required className="mt-1" />
        Acepto que LocalNow use los datos de mis compras para calcular puntos y ofrecerme recompensas.
      </label>

      <button
        type="submit"
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Continuar
      </button>
    </form>
  );
}
