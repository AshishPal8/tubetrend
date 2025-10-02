"use client";

import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { CategoryColumn, columns } from "./columns";
import React, { useEffect, useState } from "react";
import DataTable from "@/components/ui/table-comp";
import Pagination from "@/components/ui/pagination";
import axios from "axios";
import CategoryFilters from "./category-filters";

interface ApiResponse {
  data: CategoryColumn[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}
export const CategoryClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<CategoryColumn[]>([]);
  const [meta, setMeta] = useState<ApiResponse["meta"]>();

  useEffect(() => {
    const fetchCategories = async () => {
      const query = searchParams.toString();
      const url = query ? `/api/categories?${query}` : `/api/categories`;

      const res = await axios.get<ApiResponse>(url);
      setData(res.data.data);
      setMeta(res.data.meta);
    };

    fetchCategories();
  }, [searchParams]);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Category (${meta?.totalCount})`}
          description="Manage categories of blogs"
        />
        <Button onClick={() => router.push(`/dashboard/categories/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <CategoryFilters />
      <DataTable columns={columns} data={data} />
      {meta && (
        <Pagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
        />
      )}
    </>
  );
};
