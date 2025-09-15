import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const resolvedParams = await params;
    const blogId = parseInt(resolvedParams.blogId);

    if (!blogId) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const blogExists = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });

    if (!blogExists) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const [likeCount, commentCount, userLike] = await Promise.all([
      prisma.like.count({
        where: { blogId },
      }),

      prisma.comment.count({
        where: { blogId },
      }),

      userId
        ? prisma.like.findFirst({
            where: {
              blogId,
              userId,
            },
            select: { id: true },
          })
        : null,
    ]);

    return NextResponse.json({
      likeCount,
      commentCount,
      userLiked: !!userLike,
      blogId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add caching headers for better performance
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300", // Cache for 1 minute
    },
  });
}
