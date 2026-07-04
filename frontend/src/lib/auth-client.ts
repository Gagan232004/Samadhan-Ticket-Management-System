import { createAuthClient } from "better-auth/react";
import type { auth } from "../../../backend/auth";

export const authClient = createAuthClient<typeof auth>({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
