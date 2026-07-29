export function MetricCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
      {sublabel ? <span className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</span> : null}
    </div>
  );
}
