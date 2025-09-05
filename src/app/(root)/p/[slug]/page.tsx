import BlogComment from "@/components/blog/blog-comment";
import LikeCommentShare from "@/components/blog/like-comment-share";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prismadb";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const blog = await prisma.blog.findUnique({
    where: {
      slug: slug,
    },
    select: { title: true, metaDescription: true, thumbnail: true },
  });

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
      type: "website",
      siteName: "Daily Drift",
      locale: "en_US",
      images: [
        {
          url: blog.thumbnail || "",
          width: 1200,
          height: 630,
          alt: blog.title || "Daily Drift",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${blog.title} | Daily Drift`,
      description: blog.metaDescription || "Daily Drift",
      images: [blog.thumbnail || "/assets/logo.png"],
      site: "@dailydrift",
      creator: "@dailydrift",
    },
    keywords: `${blog.title}, news, youtube news, updated news, latest news`,
  };
}

const BlogPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const blog = await prisma.blog.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      content: true,
      thumbnail: true,
      metaDescription: true,
      _count: {
        select: { comments: true, likes: true },
      },
      likes: userId
        ? {
            where: { userId },
            select: { id: true },
            take: 1,
          }
        : undefined,
    },
  });

  if (!blog) return {};

  const commentCount = blog._count?.comments ?? 0;
  const likeCount = blog._count?.likes ?? 0;
  const initiallyLiked = Array.isArray(blog.likes)
    ? blog.likes.length > 0
    : false;

  return (
    <div className="max-w-4xl mx-auto mt-20 mb-10">
      <h1 className="text-5xl font-black">{blog.title}</h1>
      <div>
        <LikeCommentShare
          id={blog.id}
          commentCount={commentCount}
          initialLiked={initiallyLiked}
          initialLikeCount={likeCount}
        />
      </div>
      <div className="w-full flex justify-center mt-6">
        <Image
          src={`${blog.thumbnail}`}
          alt={blog.title}
          width={700}
          height={400}
          className="w-full rounded-3xl"
        />
      </div>
      <div
        className="prose max-w-none mt-5"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
      <div className="">
        <BlogComment id={blog.id} />
      </div>
    </div>
  );
};

export default BlogPage;
