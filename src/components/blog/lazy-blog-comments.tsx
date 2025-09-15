"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const BlogComment = dynamic(() => import("./blog-comment"), {
  loading: () => (
    <div className="mt-16 border-t pt-8">
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="p-4 bg-gray-100 rounded-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

export default function LazyBlogComment({ id }: { id: number }) {
  return (
    <Suspense
      fallback={
        <div className="mt-16 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
        </div>
      }
    >
      <BlogComment id={id} />
    </Suspense>
  );
}
