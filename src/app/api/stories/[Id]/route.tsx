import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prismadb";
import { generateSlug } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ Id: string }> }
) {
  try {
    const resolvedParams = await params;
    const setId = Number(resolvedParams.Id);

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

    const ops: any[] = [];

    ops.push(
      prisma.storySet.update({
        where: { id: setId },
        data: {
          title,
          slug,
          thumbnail,
          isPublic,
          ...(authorId && { authorId: Number(authorId) }),
          categories: {
            set: (categoryIds || []).map((id: number) => ({ id })),
          },
          // clear existing tags and connectOrCreate new ones
          tags: {
            set: [], // remove all existing tag links
            connectOrCreate: tagConnectOrCreate,
          },
        },
      })
    );

    const incomingExistingIds = (storiesToCreate || [])
      .filter((s: any) => s.id)
      .map((s: any) => Number(s.id));

    ops.push(
      prisma.story.deleteMany({
        where: {
          storySetId: setId,
          id: {
            notIn: [...incomingExistingIds, ...(storyIdsToConnect || [])],
          },
        },
      })
    );

    const updates = (storiesToCreate || []).filter((s: any) => s.id);
    for (const s of updates) {
      ops.push(
        prisma.story.update({
          where: { id: Number(s.id) },
          data: {
            mediaUrl: s.mediaUrl,
            type: s.type,
            caption: s.caption,
            duration: s.duration,
          },
        })
      );
    }

    const creates = (storiesToCreate || []).filter((s: any) => !s.id);
    if (creates.length) {
      ops.push(
        prisma.story.createMany({
          data: creates.map((s: any) => ({
            storySetId: setId,
            mediaUrl: s.mediaUrl,
            type: s.type,
            caption: s.caption,
            duration: s.duration,
          })),
          skipDuplicates: true,
        })
      );
    }

    if ((storyIdsToConnect || []).length) {
      ops.push(
        prisma.story.updateMany({
          where: {
            id: { in: storyIdsToConnect.map((id: number) => Number(id)) },
            storySetId: { not: setId },
          },
          data: { storySetId: setId },
        })
      );
    }

    await prisma.$transaction(ops);

    const refreshed = await prisma.storySet.findUnique({
      where: { id: setId },
      select: { id: true, title: true },
    });

    return NextResponse.json({ id: refreshed?.id }, { status: 200 });
  } catch (error) {
    console.error("Error updating story set:", error);
    return NextResponse.json(
      { error: "Failed to update story set" },
      { status: 500 }
    );
  }
}
