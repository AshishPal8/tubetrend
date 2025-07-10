import prisma from "@/lib/prismadb";
import { StoriesForm } from "./components/stories-form";
import { notFound } from "next/navigation";

const StoriesPage = async ({
  params,
}: {
  params: Promise<{ storiesId: string }>;
}) => {
  const resolvedParams = await params;
  const storiesId = resolvedParams.storiesId;

  const categories =
    (await prisma.category.findMany({
      where: { isActive: true, isDeleted: false },
    })) || [];

  const tags = await prisma.tag.findMany();
  const story =
    (await prisma.story.findMany({
      where: {
        isDeleted: false,
      },
    })) || [];

  if (storiesId === "new") {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <StoriesForm
            initialData={null}
            categories={categories}
            tags={tags}
            story={story}
          />
        </div>
      </div>
    );
  }

  const storySet = await prisma.storySet?.findUnique({
    where: {
      id: Number(storiesId),
    },
    include: {
      categories: true,
      tags: true,
      stories: true,
    },
  });

  if (!storySet) return notFound();

  const initialData = {
    title: storySet.title,
    thumbnail: storySet.thumbnail ?? "",
    isPublic: storySet.isPublic,
    categories: storySet.categories.map((c) => c.id.toString()),
    tags: storySet.tags.map((t) => t.name),

    storiesToCreate: storySet.stories.map((s) => ({
      id: s.id,
      mediaUrl: s.mediaUrl,
      type: s.type,
      caption: s.caption ?? "",
      duration: s.duration,
    })),

    storyIdsToConnect: storySet.stories.map((s) => s.id),
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <StoriesForm
          initialData={initialData}
          categories={categories}
          tags={tags}
          story={story}
        />
      </div>
    </div>
  );
};

export default StoriesPage;
