import prisma from "@/lib/prismadb";
import React from "react";
import { CategoryColumn } from "./components/columns";
import { CategoryClient } from "./components/client";
import { format } from "date-fns";

export default async function Categories() {
  const categories =
    (await prisma.category.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    })) || [];

  const formattedCategories: CategoryColumn[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    createdAt: format(category.createdAt, "MMMM dd yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <CategoryClient data={formattedCategories} />
      </div>
    </div>
  );
}
