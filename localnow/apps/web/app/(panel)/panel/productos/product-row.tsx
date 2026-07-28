import type { Product } from '@/lib/types';

const UNIT_LABELS: Record<Product['unit'], string> = {
  UNIT: 'ud.',
  KG: 'kg',
  L: 'L',
};

export function ProductRow({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200">
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt="" className="h-12 w-12 rounded object-cover" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-lg text-gray-300">
          {product.name.charAt(0)}
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <span className="font-medium text-gray-900">{product.name}</span>
        <span className="text-xs text-gray-400">
          {product.ean ?? product.plu ?? 'sin código'}
          {product.category ? ` · ${product.category}` : ''}
        </span>
      </div>
      <span className="font-semibold text-gray-900">
        {product.price.toFixed(2)}€
        <span className="text-xs font-normal text-gray-400"> / {UNIT_LABELS[product.unit]}</span>
      </span>
    </div>
  );
}
