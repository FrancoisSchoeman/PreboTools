import { NextAuthOptions } from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import EmailProvider from 'next-auth/providers/email';
import db from '@/db';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const isAllowedToSignIn =
        user.email === process.env.ADMIN_EMAIL ||
        user.email?.endsWith(process.env.ALLOWED_DOMAIN!);
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        // return false;
        // Or you can return a URL to redirect to:
        return '/';
      }
    },
  },
};
