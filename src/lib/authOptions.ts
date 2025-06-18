import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "./prismadb";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ email: credentials.email }, { phone: credentials.email }],
            },
          });
          if (!user) {
            throw new Error("No user found!");
          }

          if (!user.password) {
            throw new Error("User password is missing!");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValid) {
            throw new Error("Invalid credential");
          }

          return {
            id: user.id.toString(),
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            avatar: user.avatar || "",
            isAdmin: user.isAdmin === true,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findFirst({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: user.name,
              email: user.email!,
              avatar: user.image,
              password: "",
              phone: "",
            },
          });
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.avatar = user.image || "";
      }

      if (token?.email) {
        const dbUser = await prisma.user.findFirst({
          where: { email: token.email },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isAdmin: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id.toString();
          token.name = dbUser.name ?? "";
          token.email = dbUser.email ?? "";
          token.phone = dbUser.phone ?? "";
          token.avatar = dbUser.avatar ?? "";
          token.isAdmin = dbUser.isAdmin ?? false;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.phone = token.phone as string;
        session.user.avatar = token.avatar as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }

      return session;
    },
  },
};
