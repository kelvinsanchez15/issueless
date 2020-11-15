import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const options = {
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Providers.Email({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_FROM,
    }),
  ],
  adapter: Adapters.Prisma.Adapter({ prisma }),
  secret: process.env.SECRET,
  pages: { newUser: '/welcome' },
  callbacks: {
    session: async (session, user) => {
      session.userId = user.id;
      session.username = user.username;
      return Promise.resolve(session);
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
