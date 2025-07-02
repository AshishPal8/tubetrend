import prisma from "@/lib/prismadb";

export async function getFeatureBlgs() {
  return await prisma.blog.findMany({
    where: { featured: true },
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
  });
}
