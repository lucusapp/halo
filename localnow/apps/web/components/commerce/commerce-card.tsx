import Link from 'next/link';
import { COMMERCE_CATEGORIES } from '@localnow/shared';
import { COMMERCE_CATEGORY_COLORS } from '@/lib/category-colors';
import type { PublicCommerce } from '@/lib/types';

export function CommerceCard({ commerce }: { commerce: PublicCommerce }) {
  const label =
    COMMERCE_CATEGORIES.find((category) => category.value === commerce.category)?.label ?? commerce.category;

  return (
    <Link
      href={`/comercios/${commerce.id}`}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
    >
      {commerce.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={commerce.logoUrl} alt="" className="h-32 w-full object-cover" />
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-gray-100">
          <span className="text-2xl font-bold text-gray-300">{commerce.name.charAt(0)}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span
          className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${COMMERCE_CATEGORY_COLORS[commerce.category]}`}
        >
          {label}
        </span>
        <h2 className="font-semibold text-gray-900">{commerce.name}</h2>
        <p className="text-sm text-gray-500">{commerce.address}</p>
      </div>
    </Link>
  );
}
