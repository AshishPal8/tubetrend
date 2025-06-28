"use client";

import BlogCard from "@/components/ui/blog-card";
import { IBlogs } from "@/types/blogs";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const SearchResult = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [blogs, setBlogs] = useState<IBlogs[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchResults = async (page: number) => {
    if (!query || loading || !hasMore) return;

    try {
      setLoading(true);
      const res = await axios.get(`/api/blogs/search?q=${query}&page=${page}`);
      const newBlogs = res.data.blogs;
      if (newBlogs.length === 0) setHasMore(false);
      setBlogs((prev) => [...prev, ...newBlogs]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching search results", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      setBlogs([]);
      setPage(1);
      setHasMore(true);
      fetchResults(1);
    }
  }, [query]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        !loading &&
        hasMore
      ) {
        fetchResults(page);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, page]);

  return (
    <div className="mt-20 container mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        Search Results for: <span className="text-primary">{query}</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {loading && <p className="text-center mt-4">Loading more blogs...</p>}
      {!hasMore && !loading && blogs.length > 0 && (
        <p className="text-center mt-4 text-gray-500">No more results.</p>
      )}
    </div>
  );
};

export default SearchResult;
