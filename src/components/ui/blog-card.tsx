import Image from "next/image";
import Link from "next/link";
import { IBlogs } from "@/types/blogs";
import { Clock } from "lucide-react";

export default function BlogCard({ blog }: { blog: IBlogs }) {
  return (
    <Link href={`/p/${blog.slug}`} className="group block">
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl p-2">
        {/* Image section */}
        <div className="relative h-64 w-full rounded-3xl overflow-hidden">
          <Image
            src={`${blog.thumbnail}?tr=w-600,h-400`}
            fill
            alt={blog.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />

          {/* Top indicators */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            {/* Read time */}
            <div className="flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full">
              <Clock className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-medium">
                {blog.readTime} min
              </span>
            </div>
          </div>
        </div>

        {/* White content section */}
        <div className="p-2 space-y-2">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
            {blog.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
            {blog.metaDescription}
          </p>

          {/* Read button */}
          <button className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-gray-800">
            Read Now
          </button>
        </div>
      </div>
    </Link>
  );
}
