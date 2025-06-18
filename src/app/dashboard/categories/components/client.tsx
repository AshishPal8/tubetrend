"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { CategoryColumn, columns } from "./columns";
import React from "react";

interface CategoryClientProps {
  data: CategoryColumn[];
}

export const CategoryClient: React.FC<CategoryClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Category (${data.length})`}
          description="Manage categories of blogs"
        />
        <Button onClick={() => router.push(`/dashboard/categories/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchableColumns={["name"]} />
    </>
  );
};
