"use client";
import React, { useRef } from "react";
import { Heading } from "../ui/heading";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface IStoryset {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
}

const StoriesSlider = ({ storySet }: { storySet: IStoryset[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const child = scrollRef.current.querySelector("div[data-story]");
      const scrollAmount = child
        ? (child as HTMLElement).offsetWidth + 16
        : 150; // one story + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mt-6 relative">
      <Heading title="Recent Stories" />

      {/* Arrows */}
      <button
        onClick={() => scrollBy("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scrollBy("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 mt-5 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {storySet.map((stories) => (
          <div
            key={stories.id}
            data-story
            className="border-4 border-blue-600 p-1 w-24 md:w-32 h-24 md:h-32 rounded-full flex-shrink-0 overflow-hidden"
          >
            <Link href={`/stories/${stories.slug}`}>
              <Image
                src={stories.thumbnail}
                alt={stories.title}
                width={128}
                height={128}
                className="w-20 md:w-28 h-20 md:h-28 rounded-full aspect-square object-cover"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesSlider;
