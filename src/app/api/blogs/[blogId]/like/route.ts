import prisma from "@/lib/prismadb";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const blogId = Number(resolvedParams.blogId);

    const userId = Number(session.user.id);

    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_blogId: { userId, blogId },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_blogId: { userId, blogId },
        },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId,
          blogId,
        },
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to togle like" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    const resolvedPromise = await params;
    const blogId = Number(resolvedPromise.blogId);

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });
    if (!blog) return NextResponse.json({ liked: false, likeCount: 0 });

    const likeCountPromise = prisma.like.count({
      where: { blogId },
    });

    if (!session?.user?.id) {
      const likeCount = await likeCountPromise;
      return NextResponse.json({ liked: false, likeCount });
    }
    const userId = Number(session?.user.id);

    const likePromise = prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    const [like, likeCount] = await Promise.all([
      likePromise,
      likeCountPromise,
    ]);

    return NextResponse.json({ liked: !!like, likeCount });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to togle like" },
      { status: 500 }
    );
  }
}
