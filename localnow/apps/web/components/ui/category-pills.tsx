import Link from 'next/link';
import { withBasePath } from '@/lib/base-path';

interface CategoryOption {
  value: string;
  label: string;
}

export function CategoryPills({
  categories,
  activeValue,
  basePath,
}: {
  categories: CategoryOption[];
  activeValue?: string;
  basePath: string;
}) {
  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <Link href={withBasePath(basePath)} className={pillClass(!activeValue)}>
        Todas
      </Link>
      {categories.map((category) => (
        <Link
          key={category.value}
          href={withBasePath(`${basePath}?category=${category.value}`)}
          className={pillClass(activeValue === category.value)}
        >
          {category.label}
        </Link>
      ))}
    </nav>
  );
}

function pillClass(active: boolean): string {
  const base = 'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors';
  return active ? `${base} bg-gray-900 text-white` : `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
}
