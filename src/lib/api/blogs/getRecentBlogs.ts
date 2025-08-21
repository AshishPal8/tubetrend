import prisma from "@/lib/prismadb";

export async function getRecentBlogs(limit: number = 8) {
  return await prisma.blog.findMany({
    where: { isActive: true, isDeleted: false },
    select: {
      id: true,
      title: true,
      metaDescription: true,
      thumbnail: true,
      views: true,
      slug: true,
      readTime: true,
      content: true,
      createdAt: true,
      categories: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}
