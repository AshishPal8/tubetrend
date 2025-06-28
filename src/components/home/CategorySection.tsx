import { getBlogsByCategorySlug } from "@/lib/api/blogs/getBlogsByCategory";
import React from "react";
import { Heading } from "../ui/heading";
import BlogCard from "../ui/blog-card";

interface Props {
  slug: string;
  title: string;
  limit?: number;
}

export const CategorySection = async ({ title, slug }: Props) => {
  const blogs = await getBlogsByCategorySlug(slug);

  if (!blogs) return null;

  return (
    <section className="mb-10 mt-12">
      <div className="my-2">
        <Heading title={title} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {blogs.slice(0, 8).map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
