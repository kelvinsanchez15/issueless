/* eslint-disable no-param-reassign */
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';

import prisma from 'src/utils/db/prisma';

const options = {
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
