import prisma from "@/lib/prismadb";

export async function getTrendingBlogs() {
  return await prisma.blog.findMany({
    where: { isTrending: true, isActive: true, isDeleted: false },
    select: {
      id: true,
      title: true,
      thumbnail: true,
      slug: true,
      readTime: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
