import type { NextAuthOptions, Session } from "next-auth"
import Google from "next-auth/providers/google"
import type { JWT } from "next-auth/jwt"

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/kirjaudu",
  },
  callbacks: {
    async jwt({ token }: { token: JWT }) {
      if (token.email) {
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
        token.isAdmin = !!adminEmail && token.email.toLowerCase() === adminEmail
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && typeof token.isAdmin === "boolean") {
        session.user.isAdmin = token.isAdmin
      }
      return session
    },
  },
}
