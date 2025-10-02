"use client";

import { CellAction } from "./cell-action";

export type CategoryColumn = {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
};

export const columns = [
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
    accessorKey: "Action",
    header: "Action",
    render: (row) => <CellAction data={row} />,
  },
];
