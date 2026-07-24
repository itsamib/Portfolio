"use client";

import { ReactNode } from "react";
import { Trash2, Edit2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  rows,
  getRowId,
  onEdit,
  onDelete,
  emptyMessage = "No records yet.",
}: DataTableProps<T>) {
  const { language } = useLanguage();
  const isRtl = language === "fa";

  if (rows.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-sm text-slate-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="glass-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400">
            {columns.map((col) => {
              const alignClass =
                col.align === "right"
                  ? isRtl
                    ? "text-left"
                    : "text-right"
                  : isRtl
                  ? "text-right"
                  : "text-left";
              return (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 font-medium whitespace-nowrap ${alignClass}`}
                >
                  {col.header}
                </th>
              );
            })}
            {(onEdit || onDelete) && <th className="px-4 py-3.5 w-20 text-center">عملیات</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-gray-200">
          {rows.map((row) => (
            <tr
              key={getRowId(row)}
              className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              {columns.map((col) => {
                const alignClass =
                  col.align === "right"
                    ? isRtl
                      ? "text-left"
                      : "text-right"
                    : isRtl
                    ? "text-right"
                    : "text-left";
                return (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 whitespace-nowrap ${alignClass}`}
                  >
                    {col.render(row)}
                  </td>
                );
              })}
              {(onEdit || onDelete) && (
                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        aria-label="Edit row"
                        title="ویرایش"
                        className="text-slate-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400 transition-colors p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        aria-label="Delete row"
                        title="حذف"
                        className="text-slate-400 hover:text-rose-600 dark:text-gray-500 dark:hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
