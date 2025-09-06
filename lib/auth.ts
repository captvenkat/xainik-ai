import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "./db";

export const { handlers: { GET, POST }, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
  ],
  callbacks: {
    async signIn({ profile, account }) {
      // upsert user
      if (!profile?.email) return false;
      const existing = await prisma.user.upsert({
        where: { email: profile.email as string },
        create: { email: profile.email as string, name: profile.name || "" },
        update: { name: profile.name || "" }
      });
      return !!existing;
    },
    async session({ session }) {
      // attach role minimal
      return session;
    }
  },
  session: { strategy: "jwt" }
});
