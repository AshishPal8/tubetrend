import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prismadb";
import { calculateReadTime, generateSlug } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  const resolvedParams = await params;
  const blogId = Number(resolvedParams.blogId);

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
      isTrending,
      featured,
      authorId,
      categories = [],
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

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title,
        content,
        thumbnail,
        metaDescription,
        isActive,
        isTrending,
        featured,
        readTime: calculateReadTime(content),
        authorId: Number(authorId),
        slug: generateSlug(title),
        categories: {
          set: [],
          connect: categories.map((id: number) => ({ id })),
        },
        tags: {
          set: [],
          connect: allTags.map((tag) => ({ id: tag.id })),
        },
      },
    });

    return NextResponse.json({ id: updatedBlog.id }, { status: 200 });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  const resolvedParams = await params;
  const blogId = Number(resolvedParams.blogId);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
    });
    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    await prisma.blog.update({
      where: { id: blogId },
      data: {
        isDeleted: true,
      },
    });

    return NextResponse.json({ message: "Blog deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}
