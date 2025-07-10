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

    await prisma.$transaction(
      async (tx) => {
        await tx.storySet.update({
          where: { id: setId },
          data: {
            title,
            slug,
            thumbnail,
            isPublic,
            ...(authorId && { authorId: Number(authorId) }),
            categories: { set: categoryIds.map((id: number) => ({ id })) },

            tags: {
              // remove all then connect/create anew
              set: tagNames.map((name: string) => ({ name })),
              connectOrCreate: tagConnectOrCreate,
            },
          },
        });

        const incomingExistingIds = storiesToCreate
          .filter((s: any) => s.id)
          .map((s: any) => s.id as number);

        await tx.story.deleteMany({
          where: {
            storySetId: setId,
            id: { notIn: [...incomingExistingIds, ...storyIdsToConnect] },
          },
        });

        for (const s of storiesToCreate) {
          if (s.id) {
            // update existing
            await tx.story.update({
              where: { id: s.id },
              data: {
                mediaUrl: s.mediaUrl,
                type: s.type,
                caption: s.caption,
                duration: s.duration,
              },
            });
          } else {
            await tx.story.create({
              data: {
                storySetId: setId,
                mediaUrl: s.mediaUrl,
                type: s.type,
                caption: s.caption,
                duration: s.duration,
              },
            });
          }
        }
        if (storyIdsToConnect.length) {
          await tx.story.updateMany({
            where: {
              id: { in: storyIdsToConnect },
              storySetId: { not: setId },
            },
            data: { storySetId: setId },
          });
        }
      },
      { timeout: 15000 }
    );

    const refreshed = await prisma.storySet.findUnique({
      where: { id: setId },
      select: {
        id: true,
        title: true,
      },
    });

    return NextResponse.json(refreshed, { status: 200 });
  } catch (error) {
    console.error("Error updating story set:", error);
    return NextResponse.json(
      { error: "Failed to update story set" },
      { status: 500 }
    );
  }
}
