import prisma from "@/lib/prismadb";
import { BlogForm } from "./components/blog-form";
import { notFound } from "next/navigation";

const BlogPage = async ({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) => {
  const resolvedParams = await params;
  const blogId = resolvedParams.blogId;

  const categories =
    (await prisma.category.findMany({
      where: { isActive: true, isDeleted: false },
    })) || [];

  const tags = await prisma.tag.findMany();

  if (blogId === "new") {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <BlogForm initialData={null} categories={categories} tags={tags} />
        </div>
      </div>
    );
  }

  const blog = await prisma.blog?.findUnique({
    where: {
      id: Number(blogId),
    },
    include: {
      categories: true,
      tags: true,
    },
  });

  if (!blog) {
    return notFound();
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <BlogForm
          initialData={{
            ...blog,
            thumbnail: blog.thumbnail || "",
            categories: blog.categories.map((cat) => cat.id.toString()),
            tags: blog.tags.map((tag) => tag.name),
          }}
          categories={categories}
          tags={tags}
        />
      </div>
    </div>
  );
};

export default BlogPage;
