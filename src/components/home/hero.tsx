"use client";
import { IBlogs } from "@/types/blogs";
import { BookMarked } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";
import { truncateTextByWords } from "@/lib/utils";

interface FeaturedBlogs {
  blogs: IBlogs[];
}
const Hero: React.FC<FeaturedBlogs> = ({ blogs }) => {
  const [active, setActive] = useState(0);
  const blog = blogs[active];

  const router = useRouter();

  if (!blog) {
    return <div>No blogs found!</div>;
  }

  return (
    <div
      className="relative h-[30vh] md:h-[60vh] w-3/3 md:w-2/3 overflow-hidden rounded-2xl cursor-pointer"
      onClick={() => router.push(`/p/${blog.slug}`)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={blog.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${blog?.thumbnail})` }}
        >
          {/* Top + Bottom Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/0" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Overlay Text Content */}
      <div className="relative z-10 h-full px-6 pb-1 md:pb-8 md:px-16 flex flex-col justify-end">
        <div className="max-w-lg text-white space-y-4">
          <motion.h1
            key={blog.title}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-lg md:text-3xl font-bold leading-tight line-clamp-2"
          >
            {blog.title}
          </motion.h1>
          <motion.div
            className="hidden md:flex gap-2"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {blog.categories.map((cat) => (
              <Badge
                key={cat.id}
                className="font-semibold text-xs leading-tight"
              >
                {cat.name}
              </Badge>
            ))}
          </motion.div>
          <motion.p
            key={blog.content}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block text-sm md:text-base text-gray-200 font-medium line-clamp-2 leading-tight"
          >
            {truncateTextByWords(blog.metaDescription, 20)}
          </motion.p>
        </div>
        {/* Thumbnail Selector - Right Side */}
        <div className="w-full flex flex-col md:flex-row gap-2 md:gap-0 justify-end md:justify-between items-center md:items-end">
          <div className="hidden md:flex items-center justify-start gap-4 w-2/2 md:w-1/2">
            <button className="px-2 md:px-3 py-1 md:py-2 bg-primary rounded text-white font-semibold text-xl cursor-pointer">
              Read Now
            </button>
          </div>
          <div
            className="flex overflow-x-auto gap-3 z-20 px-2 py-2 scrollbar-hide rounded-md w-2/2 md:w-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            {blogs.map((b, i) => (
              <Image
                key={i}
                src={`${b.thumbnail}?tr=w-300,h-150`}
                alt={b.title}
                width={150}
                height={90}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(i);
                }}
                className={`w-[60px] md:w-[80px] h-[30px] md:h-[40px] object-cover rounded-md border transition-all duration-300 cursor-pointer ${
                  i === active ? "border-white scale-105" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
