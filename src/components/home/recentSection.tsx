import React from "react";
import { Heading } from "../ui/heading";
import BlogCard from "../ui/blog-card";
import { getRecentBlogs } from "@/lib/api/blogs/getRecentBlogs";

export const RecentSection = async () => {
  const blogs = await getRecentBlogs(8);

  if (!blogs) return null;

  return (
    <section className="mb-10 mt-12">
      <div className="my-2">
        <Heading title="Recent News" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
};

export default RecentSection;
