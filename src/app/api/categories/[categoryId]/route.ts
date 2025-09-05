import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prismadb";
import { generateSlug } from "@/lib/utils";
import { ICategory } from "@/types/category";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const resolvedParams = await params;
  const categoryId = Number(resolvedParams.categoryId);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ICategory = await req.json();
    const { name, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    let updatedSlug = existingCategory.slug;
    if (existingCategory.name !== name) {
      updatedSlug = generateSlug(name);
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        isActive,
        slug: updatedSlug,
      },
    });

    return NextResponse.json({ id: updatedCategory.id }, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const resolvedParams = await params;
  const categoryId = Number(resolvedParams.categoryId);

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.category.update({
        where: { id: categoryId },
        data: { isDeleted: true },
      }),
      prisma.blog.updateMany({
        where: {
          categories: {
            some: {
              id: categoryId,
            },
          },
        },
        data: {
          isDeleted: true,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
