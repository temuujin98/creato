import type { ReactNode } from "react";

type AdminTableProps = {
  headers: string[];
  rows: ReactNode[][];
};

export function AdminTable({ headers, rows }: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-[1.5rem] border border-white/10 bg-white/[0.025]">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase text-white/42">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-4 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8 text-white/66">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition hover:bg-white/[0.025]">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-4 align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
