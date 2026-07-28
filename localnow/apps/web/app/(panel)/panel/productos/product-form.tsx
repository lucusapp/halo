'use client';

import { useRef, useState, useTransition } from 'react';
import { createProductAction } from './actions';

interface OffLookupResult {
  name: string;
  category: string | null;
  imageUrl: string | null;
}

// Open Food Facts es una API pública con CORS abierto (verificado: access-control-allow-origin: *),
// así que se consulta directo desde el navegador — no aporta nada pasarla por
// nuestro backend. Solo rellena nombre/categoría/imagen: el precio es siempre del
// comercio, OFF no tiene datos de precio.
async function lookupOpenFoodFacts(ean: string): Promise<OffLookupResult | null> {
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(ean)}.json`);
  if (!response.ok) return null;
  const data = await response.json();
  if (data.status !== 1 || !data.product?.product_name) return null;

  const firstCategory = (data.product.categories as string | undefined)?.split(',')[0]?.trim();
  const category = firstCategory ? firstCategory.replace(/^[a-z]{2,3}:/, '') : null;

  return {
    name: data.product.product_name,
    category,
    imageUrl: data.product.image_front_url ?? data.product.image_url ?? null,
  };
}

export function ProductForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [ean, setEan] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [source, setSource] = useState<'MANUAL' | 'OPENFOODFACTS'>('MANUAL');
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'not-found' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleLookup() {
    if (!ean.trim()) return;
    setLookupState('loading');
    try {
      const result = await lookupOpenFoodFacts(ean.trim());
      if (!result) {
        setLookupState('not-found');
        return;
      }
      setName(result.name);
      if (result.category) setCategory(result.category);
      if (result.imageUrl) setImageUrl(result.imageUrl);
      setSource('OPENFOODFACTS');
      setLookupState('idle');
    } catch {
      setLookupState('error');
    }
  }

  function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await createProductAction(formData);
      if (result.ok) {
        formRef.current?.reset();
        setEan('');
        setName('');
        setCategory('');
        setImageUrl('');
        setSource('MANUAL');
        setLookupState('idle');
      } else {
        setErrorMessage(result.errorMessage ?? 'No se pudo crear el producto.');
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200"
    >
      <h2 className="font-bold text-gray-900">Nuevo producto</h2>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Código EAN (opcional)
        <div className="flex gap-2">
          <input
            name="ean"
            type="text"
            value={ean}
            onChange={(event) => setEan(event.target.value)}
            className="flex-1 rounded border border-gray-300 px-3 py-2"
            placeholder="8410179011432"
          />
          <button
            type="button"
            onClick={handleLookup}
            disabled={!ean.trim() || lookupState === 'loading'}
            className="whitespace-nowrap rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            {lookupState === 'loading' ? 'Buscando…' : 'Buscar en Open Food Facts'}
          </button>
        </div>
        {lookupState === 'not-found' ? (
          <span className="text-xs text-amber-600">No encontrado en Open Food Facts — completa los datos a mano.</span>
        ) : null}
        {lookupState === 'error' ? (
          <span className="text-xs text-red-600">No se pudo consultar Open Food Facts ahora mismo.</span>
        ) : null}
      </label>

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-20 w-20 rounded object-cover" />
      ) : null}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="source" value={source} />

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Código propio / PLU (opcional)
        <input name="plu" type="text" className="rounded border border-gray-300 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Nombre
        <input
          name="name"
          type="text"
          required
          maxLength={200}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Categoría (opcional)
        <input
          name="category"
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Precio (€)
          <input name="price" type="number" step="0.01" min="0" required className="rounded border border-gray-300 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Unidad
          <select name="unit" defaultValue="UNIT" className="rounded border border-gray-300 px-3 py-2">
            <option value="UNIT">Unidad</option>
            <option value="KG">Kg</option>
            <option value="L">Litro</option>
          </select>
        </label>
      </div>

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? 'Guardando…' : 'Añadir producto'}
      </button>
    </form>
  );
}
