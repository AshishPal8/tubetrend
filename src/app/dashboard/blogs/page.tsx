import { BlogsClient } from "./components/client";
import { BlogColumn } from "./components/columns";
import prisma from "@/lib/prismadb";

const Blogs = async () => {
  const fetchBlogs =
    (await prisma.blog?.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    })) || [];

  const formattedBlogs: BlogColumn[] = fetchBlogs.map((item) => ({
    id: item.id,
    thumbnail: item.thumbnail || "",
    title: item.title,
    likeCount: item.likeCount,
    isActive: item.isActive,
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <BlogsClient data={formattedBlogs} />
      </div>
    </div>
  );
};

export default Blogs;
