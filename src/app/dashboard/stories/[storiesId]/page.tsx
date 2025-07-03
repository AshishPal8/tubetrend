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

  const stories = await prisma.storySet?.findUnique({
    where: {
      id: Number(storiesId),
    },
    include: {
      categories: true,
      tags: true,
    },
  });

  if (!stories) {
    return notFound();
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <StoriesForm
          initialData={{
            ...stories,
            thumbnail: stories.thumbnail || "",
            categories: stories.categories.map((cat) => cat.id.toString()),
            tags: stories.tags.map((tag) => tag.name),
          }}
          categories={categories}
          tags={tags}
          story={story}
        />
      </div>
    </div>
  );
};

export default StoriesPage;
