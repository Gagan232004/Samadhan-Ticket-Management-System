import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "./db.js";

export const auth = betterAuth({
    trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:5173"],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
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
