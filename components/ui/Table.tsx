import { cn } from "@/lib/utils";

interface Column<T> { key: keyof T | string; header: string; render?: (row: T) => React.ReactNode; className?: string; }

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  sticky?: boolean;
  className?: string;
}

export function Table<T extends { id?: string }>({ columns, data, onRowClick, emptyMessage = "No records found", className }: TableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-white/8", className)}>
      <table className="w-full min-w-full">
        <thead className="bg-surface-2 border-b border-white/8">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={cn("table-header text-left", col.className)}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-white/30 text-sm">{emptyMessage}</td></tr>
          ) : data.map((row, i) => (
            <tr key={row.id || i} className={cn("table-row", onRowClick && "cursor-pointer")} onClick={() => onRowClick?.(row)}>
              {columns.map((col) => (
                <td key={String(col.key)} className={cn("table-cell", col.className)}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
