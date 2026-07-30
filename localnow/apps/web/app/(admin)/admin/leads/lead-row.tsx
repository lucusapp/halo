'use client';

import { useState, useTransition } from 'react';
import type { City, Lead } from '@/lib/types';
import { updateLeadStatusAction } from './actions';
import { ConvertPanel } from './convert-panel';

const STATUS_LABELS: Record<Lead['status'], string> = {
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  CONVERTED: 'Convertido',
  DISMISSED: 'Descartado',
};

const STATUS_STYLES: Record<Lead['status'], string> = {
  NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  CONTACTED: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  CONVERTED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  DISMISSED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

export function LeadRow({ lead, cities }: { lead: Lead; cities: City[] }) {
  const [showConvert, setShowConvert] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await updateLeadStatusAction(lead.id, status);
      if (!result.ok) {
        setErrorMessage(result.errorMessage ?? 'No se pudo actualizar el estado.');
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{lead.businessName}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[lead.status]}`}>
              {STATUS_LABELS[lead.status]}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {lead.name} · {lead.phone} · {lead.email} · {lead.city}
          </span>
          {lead.message ? <span className="text-xs text-gray-400 dark:text-gray-500">"{lead.message}"</span> : null}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(lead.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={lead.status}
            onChange={(event) => handleStatusChange(event.target.value)}
            disabled={isPending || lead.status === 'CONVERTED'}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900"
          >
            <option value="NEW">Nuevo</option>
            <option value="CONTACTED">Contactado</option>
            <option value="CONVERTED">Convertido</option>
            <option value="DISMISSED">Descartado</option>
          </select>
          {lead.status !== 'CONVERTED' ? (
            <button
              type="button"
              onClick={() => setShowConvert((current) => !current)}
              className="whitespace-nowrap rounded-full bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
            >
              {showConvert ? 'Cancelar' : 'Convertir en comercio'}
            </button>
          ) : null}
        </div>
      </div>

      {errorMessage ? <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p> : null}

      {showConvert ? <ConvertPanel lead={lead} cities={cities} onConverted={() => setShowConvert(false)} /> : null}
    </div>
  );
}
