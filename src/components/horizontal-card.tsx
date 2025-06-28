import { ITrendingBlog } from "@/types/blogs";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const HorizontalCard = ({ blog }: { blog: ITrendingBlog }) => {
  return (
    <Link href={`/p/${blog.slug}`}>
      <div className="flex gap-3 items-center bg-white rounded-xl shadow-sm p-1 h-[10.5vh]">
        <div className="w-16 h-16 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
          <Image
            src={`${blog.thumbnail}?tr=w-64,h-64`}
            alt={blog.title}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col justify-between h-full">
          <p className="text-sm font-medium line-clamp-2">{blog.title}</p>
          <div className="flex gap-4 text-xs text-gray-500 mt-1">
            <p>{format(new Date(blog.createdAt), "MMMM dd yyyy")}</p>
            <p>{blog.readTime} Min</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HorizontalCard;
