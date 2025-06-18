import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prismadb";
import { generateSlug } from "@/lib/utils";
import { ICategory } from "@/types/category";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ICategory = await req.json();

    const { name, isActive } = body;

    const slug = generateSlug(body.name);

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });
    if (existingCategory) {
      if (existingCategory.isDeleted) {
        const reactivatedCategory = await prisma.category.update({
          where: { slug },
          data: {
            isDeleted: false,
            isActive: true,
            name,
          },
        });

        return NextResponse.json(
          { category: reactivatedCategory, reactivated: true },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: `Category with slug "${slug}" already exists` },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        isActive,
        slug,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
