"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import Image from "next/image";

export type BlogColumn = {
  id: number;
  thumbnail: string;
  title: string;
  likeCount: number;
  isActive: boolean;
};

export const columns: ColumnDef<BlogColumn>[] = [
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
    accessorKey: "likeCount",
    header: "Likes",
  },
  {
    accessorKey: "isActive",
    header: "Active",
  },
  {
    id: "Action",
    cell: ({ row }) => <CellAction data={row.original} />,
    header: "Action",
  },
];
