'use client';

import { useRef, useState, useTransition } from 'react';
import { createLeadAction } from './actions';

// Botón + modal reutilizado en el pie del directorio de comercios y en cada
// tarjeta de noticia, junto a "Negocios relacionados" (§9.4, nivel 1). Un solo
// componente autocontenido: gestiona su propio estado de apertura/envío, así cada
// sitio donde se usa solo tiene que decidir el estilo del botón (className).
export function BecomeCommerceButton({ className, defaultCity }: { className?: string; defaultCity?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? 'rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800'}
      >
        Quiero estar en LocalNow
      </button>
      {open ? <LeadFormModal defaultCity={defaultCity} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function LeadFormModal({ defaultCity, onClose }: { defaultCity?: string; onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createLeadAction(formData);
      if (result.ok) {
        setSuccess(true);
      } else {
        setErrorMessage(result.errorMessage ?? 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-form-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="lead-form-title" className="font-serif text-xl font-bold text-gray-900">
            Quiero estar en LocalNow
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
            ✕
          </button>
        </div>

        {success ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600">
              ¡Gracias! Hemos recibido tu solicitud y nos pondremos en contacto contigo pronto.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Tu nombre
              <input name="name" type="text" required maxLength={150} className="rounded border border-gray-300 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Nombre del negocio
              <input
                name="businessName"
                type="text"
                required
                maxLength={150}
                className="rounded border border-gray-300 px-3 py-2"
              />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Teléfono
                <input name="phone" type="tel" required maxLength={30} className="rounded border border-gray-300 px-3 py-2" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Email
                <input name="email" type="email" required className="rounded border border-gray-300 px-3 py-2" />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Ciudad
              <input
                name="city"
                type="text"
                required
                maxLength={100}
                defaultValue={defaultCity}
                className="rounded border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700">
              Mensaje (opcional)
              <textarea name="message" rows={3} maxLength={2000} className="rounded border border-gray-300 px-3 py-2" />
            </label>

            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPending ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
