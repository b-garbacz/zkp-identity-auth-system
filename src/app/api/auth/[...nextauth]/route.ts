import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/services/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  secret: process.env.MY_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        username: {
          label: "E-mail",
          type: "email",
          placeholder: "example@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        const user = await prisma.user.findFirst({
          where: { email: credentials?.username },
        });
        const comparePasswords = await bcrypt.compare(
          credentials?.password ?? "",
          user?.password ?? ""
        );
        if (comparePasswords && user) return user;
        else return null;
      },
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
