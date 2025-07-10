import prisma from "@/lib/prismadb";
import React from "react";
import { Heading } from "../ui/heading";
import Image from "next/image";
import Link from "next/link";

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

  return (
    <div>
      <Heading title="Recent Stories" />
      <div className="">
        {storySet.map((stories) => (
          <div
            key={stories.id}
            className="border-4 border-blue-600 p-1 w-fit rounded-full"
          >
            <Link href={`/stories/${stories.slug}`}>
              <Image
                src={stories.thumbnail}
                alt={stories.title}
                width={300}
                height={300}
                className="w-32 h-32 rounded-full aspect-square object-cover"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesSection;
