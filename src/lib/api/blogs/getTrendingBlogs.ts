import prisma from "@/lib/prismadb";

export async function getTrendingBlogs() {
  return await prisma.blog.findMany({
    where: { featured: true },
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
