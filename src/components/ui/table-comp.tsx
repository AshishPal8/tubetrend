import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ColumnConfig = {
  accessorKey: string;
  header: string;
  render?: (row: Record<string, any>) => React.ReactNode;
};

type SimpleTableProps = {
  columns: ColumnConfig[];
  data: Record<string, any>[];
  className?: string;
};

export default function DataTable({
  columns,
  data,
  className,
}: SimpleTableProps) {
  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.accessorKey}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No data
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col.accessorKey}>
                    {col.render
                      ? col.render(row) // custom renderer if provided
                      : row[col.accessorKey] ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
