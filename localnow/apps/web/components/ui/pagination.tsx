import Link from 'next/link';

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefForPage(target: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== 'page') params.set(key, value);
    }
    params.set('page', String(target));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-4 py-6 text-sm">
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} className="text-gray-700 underline">
          Anterior
        </Link>
      ) : (
        <span className="text-gray-300">Anterior</span>
      )}
      <span className="text-gray-500">
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefForPage(page + 1)} className="text-gray-700 underline">
          Siguiente
        </Link>
      ) : (
        <span className="text-gray-300">Siguiente</span>
      )}
    </div>
  );
}
