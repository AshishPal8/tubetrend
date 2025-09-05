import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prismadb";
import { calculateReadTime, generateSlug } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      title,
      content,
      thumbnail,
      metaDescription,
      isActive,
      authorId,
      isTrending,
      featured,
      categories: categoryIds = [],
      tags: tagNames = [],
    } = body;

    if (isTrending) {
      const trendingBlogs = await prisma.blog.findMany({
        where: { isTrending: true },
        orderBy: { updatedAt: "asc" },
        take: 5,
      });

      if (trendingBlogs.length >= 5) {
        const oldest = trendingBlogs[0];
        await prisma.blog.update({
          where: { id: oldest.id },
          data: { isTrending: false },
        });
      }
    }

    if (featured) {
      const featuredBlogs = await prisma.blog.findMany({
        where: { featured: true },
        orderBy: { updatedAt: "asc" },
        take: 5,
      });

      if (featuredBlogs.length >= 5) {
        const oldest = featuredBlogs[0];
        await prisma.blog.update({
          where: { id: oldest.id },
          data: { featured: false },
        });
      }
    }

    const existingTags = await prisma.tag.findMany({
      where: { name: { in: tagNames } },
    });

    const existingTagNames = existingTags.map((tag) => tag.name);

    const newTagNames = tagNames.filter(
      (name: string) => !existingTagNames.includes(name)
    );

    const newTags = await Promise.all(
      newTagNames.map((name: string) => prisma.tag.create({ data: { name } }))
    );

    const allTags = [...existingTags, ...newTags];

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        thumbnail,
        metaDescription,
        isActive,
        isTrending: isTrending ?? false,
        featured: featured ?? false,
        slug: generateSlug(title),
        authorId: Number(authorId),
        readTime: calculateReadTime(content),
        categories: {
          connect: categoryIds.map((id: number) => ({ id })),
        },
        tags: {
          connect: allTags.map((tag) => ({ id: tag.id })),
        },
      },
    });

    return NextResponse.json({ id: blog.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
