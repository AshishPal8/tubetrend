"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { BlogColumn, columns } from "./columns";

interface BlogClientProps {
  data: BlogColumn[];
}

export const BlogsClient: React.FC<BlogClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Blogs (${data.length})`}
          description="Manage blogs for your business"
        />
        <Button onClick={() => router.push(`/dashboard/blogs/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchableColumns={["title"]} />
    </>
  );
};
