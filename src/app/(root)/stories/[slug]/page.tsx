import React from "react";
import StoriesPlayerWrapper from "@/components/stories/StoryPlayerWrapper";
import prisma from "@/lib/prismadb";
import { notFound } from "next/navigation";

const StoryPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const storySet = await prisma.storySet.findUnique({
    where: {
      slug,
    },
    include: {
      stories: {
        where: { isDeleted: false },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!storySet || !storySet.stories.length) return notFound();

  const allStorySet = await prisma.storySet.findMany({
    where: {
      stories: {
        some: {
          isDeleted: false,
        },
      },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  const currentIndex = allStorySet.findIndex((set) => set.slug === slug);
  const nextSlug =
    currentIndex < allStorySet.length - 1
      ? allStorySet[currentIndex + 1]?.slug
      : null;
  const prevSlug = currentIndex > 0 ? allStorySet[currentIndex - 1].slug : null;

  return (
    <div className="w-full h-screen flex justify-center items-center bg-black">
      <StoriesPlayerWrapper
        storySet={storySet}
        nextSlug={nextSlug}
        prevSlug={prevSlug}
      />
    </div>
  );
};

export default StoryPage;
