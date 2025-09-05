import prisma from "@/lib/prismadb";
import React from "react";
import StoriesSlider from "./StoriesSlider";

const StoriesSection = async () => {
  const storySet =
    (await prisma.storySet.findMany({
      where: {
        isDeleted: false,
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
      },
    })) || [];

  if (!storySet || storySet.length === 0) {
    return <div></div>;
  }

  return <StoriesSlider storySet={storySet} />;
};

export default StoriesSection;
