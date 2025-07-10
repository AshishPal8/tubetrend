"use client";

import { useRouter } from "next/navigation";
import StoriesPlayer from "./StoriesPlayer";
import { StoryType } from "@/generated/prisma";

interface Story {
  id: number;
  mediaUrl: string;
  type: StoryType;
  caption?: string | null;
  duration: number;
}

interface StorySet {
  id: number;
  title: string;
  thumbnail: string;
  stories: Story[];
}

interface Props {
  storySet: StorySet;
  nextSlug?: string | null;
  prevSlug?: string | null;
}

const StoriesPlayerWrapper = ({ storySet, nextSlug, prevSlug }: Props) => {
  const router = useRouter();

  const handleNextStorySet = () => {
    if (nextSlug) {
      router.push(`/stories/${nextSlug}`);
    }
  };

  const handlePrevStorySet = () => {
    if (prevSlug) {
      router.push(`/stories/${prevSlug}`);
    }
  };

  return (
    <StoriesPlayer
      title={storySet.title}
      thumbnail={storySet.thumbnail}
      stories={storySet.stories}
      onNextStorySet={handleNextStorySet}
      onPrevStorySet={handlePrevStorySet}
      hasNextStorySet={!!nextSlug}
      hasPrevStorySet={!!prevSlug}
    />
  );
};

export default StoriesPlayerWrapper;
