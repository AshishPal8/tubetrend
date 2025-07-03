"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import Image from "next/image";

export type StoriesColumn = {
  id: number;
  thumbnail: string;
  title: string;
  isPublic: boolean;
};

export const columns: ColumnDef<StoriesColumn>[] = [
  {
    id: "icon",
    cell: ({ row }) => (
      <div className="relative w-10 h-10">
        <Image
          src={`${row.original.thumbnail}?tr=w-50,h-50`}
          alt={row.original.title}
          fill
          className="object-cover rounded-md"
        />
      </div>
    ),
    header: "Image",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "isPublic",
    header: "Public",
  },
  {
    id: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
    header: "Action",
  },
];
