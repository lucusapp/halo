import type { Segment } from '@/lib/types';

export function SegmentRow({ segment }: { segment: Segment }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{segment.name}</span>
          {!segment.active ? (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              Inactivo
            </span>
          ) : null}
        </div>
        {segment.description ? (
          <span className="text-xs text-gray-500 dark:text-gray-400">{segment.description}</span>
        ) : null}
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {segment.lastComputedAt
            ? `Recalculado ${new Date(segment.lastComputedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}`
            : 'Todavía sin recalcular'}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{segment.userCount}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">usuarios</span>
      </div>
    </div>
  );
}
