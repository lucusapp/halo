'use client';

import { useMemo, useState, useTransition } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Product, SaleCreated } from '@/lib/types';
import { createSaleAction, type SaleItemInput } from './actions';
import { SaleQrDisplay } from './sale-qr-display';

interface CartLine {
  product: Product;
  quantity: number;
}

export function VentaClient({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [sale, setSale] = useState<SaleCreated | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) => product.name.toLowerCase().includes(query) || product.ean?.toLowerCase().includes(query),
    );
  }, [search, products]);

  const total = cart.reduce((sum, line) => sum + line.quantity * line.product.price, 0);

  function addProduct(product: Product) {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) {
        return current.map((line) => (line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line));
      }
      return [...current, { product, quantity: 1 }];
    });
  }

  function changeQuantity(productId: string, delta: number) {
    setCart((current) =>
      current
        .map((line) => (line.product.id === productId ? { ...line, quantity: line.quantity + delta } : line))
        .filter((line) => line.quantity > 0),
    );
  }

  function removeLine(productId: string) {
    setCart((current) => current.filter((line) => line.product.id !== productId));
  }

  function handleGenerateQr() {
    setErrorMessage(null);
    const items: SaleItemInput[] = cart.map((line) => ({
      productId: line.product.id,
      ean: line.product.ean,
      plu: line.product.plu,
      productName: line.product.name,
      quantity: line.quantity,
      unitPrice: line.product.price,
    }));

    startTransition(async () => {
      const result = await createSaleAction(items);
      if (result.ok && result.sale) {
        setSale(result.sale);
      } else {
        setErrorMessage(result.errorMessage ?? 'No se pudo generar el QR.');
      }
    });
  }

  function handleReset() {
    setSale(null);
    setCart([]);
    setSearch('');
    setErrorMessage(null);
  }

  if (sale) {
    return <SaleQrDisplay sale={sale} onNewSale={handleReset} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Nueva venta</h1>

      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar producto por nombre o EAN…"
        className="rounded-lg border border-gray-300 px-4 py-3 text-base"
      />

      <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-xl bg-white p-2 shadow-sm ring-1 ring-gray-200">
        {products.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">
            Todavía no tienes productos en tu catálogo — añádelos en Productos.
          </p>
        ) : filteredProducts.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">Sin resultados para &ldquo;{search}&rdquo;.</p>
        ) : (
          filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addProduct(product)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-gray-50"
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{product.name}</span>
                {product.ean ? <span className="text-xs text-gray-400">{product.ean}</span> : null}
              </div>
              <span className="font-semibold text-gray-900">{product.price.toFixed(2)}€</span>
            </button>
          ))
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-500">Carrito</h2>
        {cart.length === 0 ? (
          <p className="text-sm text-gray-400">Todavía no has añadido productos.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {cart.map((line) => (
              <div
                key={line.product.id}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{line.product.name}</span>
                  <span className="text-xs text-gray-400">{line.product.price.toFixed(2)}€ / ud.</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => changeQuantity(line.product.id, -1)}
                    className="h-8 w-8 rounded-full bg-gray-100 text-lg leading-none text-gray-700"
                    aria-label={`Quitar una unidad de ${line.product.name}`}
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-medium">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(line.product.id, 1)}
                    className="h-8 w-8 rounded-full bg-gray-100 text-lg leading-none text-gray-700"
                    aria-label={`Añadir una unidad de ${line.product.name}`}
                  >
                    +
                  </button>
                  <span className="w-16 text-right font-semibold text-gray-900">
                    {(line.quantity * line.product.price).toFixed(2)}€
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(line.product.id)}
                    className="text-gray-300 hover:text-red-500"
                    aria-label={`Quitar ${line.product.name} del carrito`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {errorMessage ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <div className="sticky bottom-4 flex items-center justify-between rounded-xl bg-gray-900 p-4 text-white shadow-lg">
        <div className="flex flex-col">
          <span className="text-xs text-gray-300">Total</span>
          <span className="text-xl font-bold">{total.toFixed(2)}€</span>
        </div>
        <button
          type="button"
          onClick={handleGenerateQr}
          disabled={cart.length === 0 || isPending}
          className="rounded-full bg-white px-5 py-2.5 font-semibold text-gray-900 disabled:opacity-40"
        >
          {isPending ? 'Generando…' : 'Generar QR'}
        </button>
      </div>
    </div>
  );
}
