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

    return NextResponse.json({ id: category.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;

    const search = url.searchParams.get("search") || "";
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 10);
    const sort = url.searchParams.get("sort") || "createdAt";
    const order = (url.searchParams.get("order") || "desc") as "asc" | "desc";

    const currentPage = Math.max(page, 1);
    const take = Math.max(pageSize, 1);
    const skip = (currentPage - 1) * take;

    // filter
    const where = {
      isDeleted: false,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive" as const,
        },
      }),
    };

    const [totalCount, data] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take,
      }),
    ]);

    const totalPages = Math.max(Math.ceil(totalCount / take), 1);

    return NextResponse.json({
      data,
      meta: {
        currentPage,
        totalPages,
        totalCount,
        pageSize: take,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
