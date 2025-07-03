import { StoriesClient } from "./components/client";
import { StoriesColumn } from "./components/columns";
import prisma from "@/lib/prismadb";

const Stories = async () => {
  const fetchStories =
    (await prisma.storySet?.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    })) || [];

  const formattedStories: StoriesColumn[] = fetchStories.map((item) => ({
    id: item.id,
    thumbnail: item.thumbnail || "",
    title: item.title,
    isPublic: item.isPublic,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <StoriesClient data={formattedStories} />
      </div>
    </div>
  );
};

export default Stories;
