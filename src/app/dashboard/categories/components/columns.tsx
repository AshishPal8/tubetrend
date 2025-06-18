"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type CategoryColumn = {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
    header: "Action",
  },
];
