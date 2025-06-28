import prisma from "@/lib/prismadb";
import { Metadata } from "next";
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
          url: blog.thumbnail,
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

  const blog = await prisma.blog.findUnique({
    where: { slug },
  });

  if (!blog) return {};

  return (
    <div className="max-w-4xl mx-auto mt-20 h-screen">
      <h1 className="text-5xl font-black">{blog.title}</h1>
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
    </div>
  );
};

export default BlogPage;
