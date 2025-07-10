import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prismadb";
import { generateSlug } from "@/lib/utils";
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
      thumbnail,
      isPublic = true,
      authorId,
      categories: categoryIds = [],
      tags: tagNames = [],
      storiesToCreate = [],
      storyIdsToConnect = [],
    } = body;

    const tagConnectOrCreate = tagNames.map((name: string) => ({
      where: { name },
      create: { name },
    }));

    const slug = generateSlug(title);

    const data = {
      title,
      slug,
      thumbnail,
      isPublic,
      authorId: Number(authorId),
      categories: {
        connect: categoryIds.map((id: number) => ({ id })),
      },
      tags: {
        connectOrCreate: tagConnectOrCreate,
      },
      stories: {
        create: storiesToCreate.map((s: any) => ({
          mediaUrl: s.mediaUrl,
          type: s.type,
          caption: s.caption,
          duration: s.duration,
        })),
        connect: storyIdsToConnect.map((id: number) => ({ id })),
      },
    };

    const storySet = await prisma.storySet.create({ data });

    return NextResponse.json(storySet, { status: 201 });
  } catch (err) {
    console.error("Error creating story set:", err);
    return NextResponse.json(
      { error: "Failed to create story set" },
      { status: 500 }
    );
  }
}
