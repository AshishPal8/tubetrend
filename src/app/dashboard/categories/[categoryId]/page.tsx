import prisma from "@/lib/prismadb";
import { CategoryForm } from "./category-form";
import { notFound } from "next/navigation";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) => {
  const resolvedParams = await params;
  const categoryId = resolvedParams.categoryId;

  if (categoryId === "new") {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <CategoryForm initialData={null} />
        </div>
      </div>
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: Number(categoryId) },
  });
  if (!category) {
    return notFound();
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <CategoryForm initialData={category} />
      </div>
    </div>
  );
};

export default CategoryPage;
