import { createAuthClient } from "better-auth/client";

const authClient = createAuthClient({
    baseURL: "http://localhost:5000"
});

async function run() {
    console.log("Testing sign up (should fail since it's disabled)...");
    const signUpRes = await authClient.signUp.email({
        email: "newtest@example.com",
        password: "password123",
        name: "New Test User"
    });
    console.log("Response:", signUpRes);

    console.log("\nTesting get session...");
    const sessionRes = await authClient.getSession();
    console.log("Session:", sessionRes.data ? sessionRes.data.session : sessionRes.error);
    
    console.log("\nTesting sign out...");
    await authClient.signOut();
    console.log("Signed out successfully.");
}

run();
