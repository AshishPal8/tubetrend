import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prismadb";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !password || (!email && !phone)) {
      return NextResponse.json(
        { error: "Name, Password and either Email or Phone is required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])],
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists. Please try another email" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "30d",
    });
    const response = NextResponse.json(
      { message: "User register successfully", user, token },
      { status: 201 }
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.log("POST_REGISTER", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
