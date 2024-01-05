import bcrypt from 'bcrypt';
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    //@ts-ignore
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/sign-in"
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "email", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const existingUser = await db.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });
                if (!existingUser) {
                    return null;
                }

                const passwordMatch = await bcrypt.compare(credentials.password, existingUser.password);

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: existingUser.id + '',
                    email: existingUser.email,
                    username: existingUser.username
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            if(user) {
                return {
                    ...token,
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            }
            return token
        },
        async session({ session, user, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    email: token.email,
                    username: token.username
                }
            }
        },
    }
}