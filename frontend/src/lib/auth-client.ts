import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:5000", // Update this with your actual backend URL in production
});

export const { signIn, signUp, signOut, useSession } = authClient;
