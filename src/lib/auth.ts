import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { query, queryOne } from "@/lib/db-pg";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await queryOne(
          "SELECT id, email, name, password, role, image FROM users WHERE email = $1",
          [credentials.email]
        );

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
        const shouldBeAdmin = adminEmails.includes(user.email);
        const existing = await queryOne("SELECT id, role FROM users WHERE email = $1", [user.email]);
        if (!existing) {
          const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const role = shouldBeAdmin ? "admin" : "user";
          await query(
            `INSERT INTO users (id, email, name, image, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, now(), now())`,
            [id, user.email, user.name ?? null, user.image ?? null, role]
          );
        } else if (shouldBeAdmin && existing.role !== "admin") {
          // Ensure admin emails always have admin role
          await query(`UPDATE users SET role = 'admin', "updatedAt" = now() WHERE email = $1`, [user.email]);
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const dbUser = await queryOne("SELECT id, role FROM users WHERE email = $1", [user.email!]);
        token.role = dbUser?.role ?? "user";
        token.id = dbUser?.id ?? user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    newUser: "/auth/register",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
