import { getTrendingBlogs } from "@/lib/api/blogs/getTrendingBlogs";
import React from "react";
import HorizontalCard from "../horizontal-card";

export const Trending = async () => {
  const blogs = await getTrendingBlogs();

  return (
    <div className="w-3/3 md:w-1/3 h-[60vh] rounded-2xl flex flex-col gap-3">
      {blogs.map((blog, index) => (
        <HorizontalCard blog={blog} key={index} />
      ))}
    </div>
  );
};

export default Trending;
