import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * Strategy is JWT — no database needed. The user's stable identity is
 * the verified Google email, which we surface as `session.user.id` for
 * downstream storage keys (see lib/storage/userid.ts for the hash).
 *
 * On Vercel, set:
 *   AUTH_SECRET             — `openssl rand -base64 32`
 *   AUTH_GOOGLE_ID          — OAuth client ID
 *   AUTH_GOOGLE_SECRET      — OAuth client secret
 *   NEXTAUTH_URL (optional) — only needed when deploying behind a proxy
 *                             that doesn't forward x-forwarded-host
 *
 * Google OAuth console redirect URI:
 *   https://<your-vercel-domain>/api/auth/callback/google
 *   http://localhost:3000/api/auth/callback/google
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      // Persist the verified email on first sign-in. The email is what
      // we hash into a stable user id for storage keys.
      if (profile?.email) {
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.id = token.email as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    // We don't ship a custom sign-in page yet — the UI agent will hook
    // signIn("google") directly from a button. Auth.js will use its
    // default page if someone hits /api/auth/signin directly.
  },
});
