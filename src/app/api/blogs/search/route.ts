import prisma from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    if (!query.trim()) {
      return NextResponse.json({ blogs: [], total: 0 });
    }

    const blogs = await prisma.blog.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { metaDescription: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          {
            categories: {
              some: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1,
      skip,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        metaDescription: true,
        readTime: true,
      },
    });

    const hasMore = blogs.length > limit;
    const slicedBlogs = blogs.slice(0, limit);

    return NextResponse.json({ blogs: slicedBlogs, hasMore });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
