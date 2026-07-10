import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "./db.js";

import bcrypt from 'bcryptjs';

export const auth = betterAuth({
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true
        },
        crossSubDomainCookies: {
            enabled: true
        }
    },
    trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        disableSignUp: false,
        password: {
            hash: async (password) => {
                return await bcrypt.hash(password, 10);
            },
            verify: async ({ hash, password }) => {
                return await bcrypt.compare(password, hash);
            }
        }
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "agent"
            }
        }
    },
    rateLimit: {
        enabled: process.env.NODE_ENV === "production"
    },
    plugins: [
        admin()
    ]
});
