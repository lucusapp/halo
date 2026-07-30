'use client';

import { useState, useTransition } from 'react';
import { COMMERCE_CATEGORIES } from '@localnow/shared';
import type { City, Lead } from '@/lib/types';
import { convertLeadAction, scrapeBusinessAction } from './actions';

// Flujo en dos pasos (§9.4, nivel 1): 1) escanear una URL (mejor esfuerzo, cheerio +
// metaetiquetas Open Graph) y 2) revisar/editar el resultado antes de confirmar el
// alta — nunca se crea el comercio directamente desde lo escaneado sin que un admin
// lo vea primero, un scrape puede fallar o traer datos incorrectos.
export function ConvertPanel({ lead, cities, onConverted }: { lead: Lead; cities: City[]; onConverted: () => void }) {
  const [url, setUrl] = useState('');
  const [scraped, setScraped] = useState<{
    name: string;
    description: string;
    phone: string;
    address: string;
    imageUrl: string;
  } | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [isScraping, startScrape] = useTransition();
  const [isConverting, startConvert] = useTransition();

  function handleScrape() {
    if (!url.trim()) return;
    setScrapeError(null);
    startScrape(async () => {
      const result = await scrapeBusinessAction(url.trim());
      if (result.ok && result.data) {
        setScraped({
          name: result.data.name ?? lead.businessName,
          description: result.data.description ?? '',
          phone: result.data.phone ?? lead.phone,
          address: result.data.address ?? '',
          imageUrl: result.data.imageUrl ?? '',
        });
      } else {
        setScrapeError(result.errorMessage ?? 'No se pudo escanear esa URL — rellena los datos a mano.');
        // Aunque falle el escaneo, se abre igualmente el formulario con lo que ya
        // sabemos del lead — no bloquea el alta manual.
        setScraped({ name: lead.businessName, description: '', phone: lead.phone, address: '', imageUrl: '' });
      }
    });
  }

  function handleConvert(formData: FormData) {
    setConvertError(null);
    startConvert(async () => {
      const result = await convertLeadAction(lead.id, formData);
      if (result.ok) {
        onConverted();
      } else {
        setConvertError(result.errorMessage ?? 'No se pudo crear el comercio.');
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 pt-3 dark:border-gray-700">
      {!scraped ? (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
            URL del negocio (web, Google Maps, redes…)
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
                className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
              <button
                type="button"
                onClick={handleScrape}
                disabled={!url.trim() || isScraping}
                className="whitespace-nowrap rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
              >
                {isScraping ? 'Escaneando…' : 'Escanear'}
              </button>
            </div>
          </label>
          {scrapeError ? <p className="text-xs text-red-600 dark:text-red-400">{scrapeError}</p> : null}
          <button
            type="button"
            onClick={() => setScraped({ name: lead.businessName, description: '', phone: lead.phone, address: '', imageUrl: '' })}
            className="w-fit text-xs text-gray-400 hover:underline"
          >
            O rellenar a mano sin escanear
          </button>
        </div>
      ) : (
        <form action={handleConvert} className="flex flex-col gap-2">
          {scraped.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={scraped.imageUrl} alt="" className="h-20 w-20 rounded object-cover" />
          ) : null}
          <input type="hidden" name="imageUrl" value={scraped.imageUrl} />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
              Nombre
              <input
                name="name"
                type="text"
                required
                defaultValue={scraped.name}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
              Email de contacto
              <input
                name="email"
                type="email"
                required
                defaultValue={lead.email}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
            Descripción
            <textarea
              name="description"
              rows={2}
              defaultValue={scraped.description}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
            />
          </label>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
              Teléfono
              <input
                name="phone"
                type="text"
                defaultValue={scraped.phone}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
              Dirección
              <input
                name="address"
                type="text"
                required
                defaultValue={scraped.address}
                placeholder={`Sin detectar automáticamente — ciudad indicada por el lead: ${lead.city}`}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
              Categoría
              <select
                name="category"
                required
                className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
              >
                {COMMERCE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
              Ciudad
              <select
                name="cityId"
                required
                className="rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-900"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {convertError ? <p className="text-xs text-red-600 dark:text-red-400">{convertError}</p> : null}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isConverting}
              className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
            >
              {isConverting ? 'Creando…' : 'Crear comercio'}
            </button>
            <button
              type="button"
              onClick={() => setScraped(null)}
              className="text-xs text-gray-400 hover:underline"
            >
              Volver a escanear
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
