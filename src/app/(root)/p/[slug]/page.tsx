import LazyBlogComment from "@/components/blog/lazy-blog-comments";
import LikeCommentShare from "@/components/blog/like-comment-share";
import prisma from "@/lib/prismadb";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { cache } from "react";

export async function generateStaticParams() {
  try {
    const blogs = await prisma.blog.findMany({
      select: { slug: true },
      orderBy: [
        { views: "desc" }, // Most viewed first
        { createdAt: "desc" },
      ],
      take: 100, // Pre-generate top 100 blogs
    });

    return blogs.map((blog) => ({
      slug: blog.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

const getBlogData = cache(async (slug: string) => {
  return await prisma.blog.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      content: true,
      thumbnail: true,
      metaDescription: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const blog = await getBlogData(slug);

  if (!blog) return notFound();

  const title = `${blog.title} | The Fitness Foods`;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
  const pageUrl = `${baseUrl}/p/${slug}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description: blog.metaDescription,
    openGraph: {
      title,
      description: blog.metaDescription,
      url: pageUrl,
      type: "article",
      siteName: "Daily Drift",
      locale: "en_US",
      publishedTime: blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      images: blog.thumbnail
        ? [
            {
              url: blog.thumbnail,
              width: 1200,
              height: 630,
              alt: blog.title || "Daily Drift",
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${blog.title} | Daily Drift`,
      description: blog.metaDescription || "Daily Drift",
      images: blog.thumbnail ? [blog.thumbnail] : ["/assets/logo.png"],
      site: "@dailydrift",
      creator: "@dailydrift",
    },
    keywords: `${blog.title}, news, youtube news, updated news, latest news`,
  };
}

const BlogPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const blog = await getBlogData(slug);

  if (!blog) return notFound();

  const commentCount = blog._count?.comments ?? 0;
  const likeCount = blog._count?.likes ?? 0;

  return (
    <div className="max-w-4xl mx-auto mt-20 mb-10">
      <h1 className="text-5xl font-black">{blog.title}</h1>
      <div>
        <LikeCommentShare
          id={blog.id}
          commentCount={commentCount}
          initialLikeCount={likeCount}
          slug={slug}
        />
      </div>
      <div className="w-full flex justify-center mt-6">
        <Image
          src={blog.thumbnail || "/assets/placeholder.jpg"}
          alt={blog.title}
          width={700}
          height={400}
          className="w-full rounded-3xl"
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Wj2nkdUTixwf8/k="
        />
      </div>
      <div
        className="prose max-w-none mt-5"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
      <LazyBlogComment id={blog.id} />
    </div>
  );
};

export default BlogPage;
