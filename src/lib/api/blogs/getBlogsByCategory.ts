import prisma from "@/lib/prismadb";

export async function getBlogsByCategorySlug(slug: string, limit = 8) {
  return prisma.blog.findMany({
    where: {
      isActive: true,
      isDeleted: false,
      categories: {
        some: { slug },
      },
    },
    include: { categories: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
