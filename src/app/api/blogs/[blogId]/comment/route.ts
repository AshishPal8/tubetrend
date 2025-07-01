import prisma from "@/lib/prismadb";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const resolvedParams = await params;
    const blogId = Number(resolvedParams.blogId);

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });

    if (!blog) return NextResponse.json([], { status: 200 });

    const comments = await prisma.comment.findMany({
      where: { blogId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            avatar: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

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
    const { comment } = await req.json();

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });

    if (!blog)
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        blogId,
        userId,
        content: comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Comment added", comment: newComment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
