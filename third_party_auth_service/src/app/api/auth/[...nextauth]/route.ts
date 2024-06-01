import { prisma } from '@/services/prisma';
import bcrypt from 'bcrypt';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  secret: process.env.MY_SECRET,

  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      id: 'login',

      credentials: {
        email: {
          label: 'E-mail',
          type: 'email',
          placeholder: 'example@gmail.com',
        },
        password: { label: 'Password', type: 'password' },
      },

      // @ts-ignore
      async authorize(credentials, req) {
        const user = await prisma.user.findFirst({
          where: { email: credentials?.email },
        });

        const comparePasswords = await bcrypt.compare(credentials?.password ?? '', user?.password ?? '');

        if (comparePasswords && user) return user;
        else return null;
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      id: 'signup',

      credentials: {
        email: {
          label: 'E-mail',
          type: 'email',
          placeholder: 'example@gmail.com',
        },
        password: { label: 'Password', type: 'password' },
      },

      // @ts-ignore
      async authorize(credentials, req) {
        if (!credentials) return null;
        if (!credentials?.email && !credentials?.password) return null;

        const { email, password } = credentials;
        const hashedPassword = await bcrypt.hash(password, 10);

        const userExists = await prisma.user.findFirst({
          where: { email },
        });

        if (userExists) return null;

        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
          },
        });

        return user;
      },
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
