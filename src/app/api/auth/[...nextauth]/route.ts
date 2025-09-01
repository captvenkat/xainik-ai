import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const missing: string[] = [];
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "";

if (!GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
if (!GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
if (!NEXTAUTH_SECRET) missing.push("NEXTAUTH_SECRET");

if (missing.length) {
  // Guardrail: do not throw; log checklist
  // eslint-disable-next-line no-console
  console.warn("[Voices] Missing items:", missing);
}

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET || undefined,
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: GOOGLE_CLIENT_SECRET || "placeholder",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile && (profile as any).email) {
        token.email = (profile as any).email as string;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


