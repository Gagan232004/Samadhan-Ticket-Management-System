import { authClient } from "./frontend/src/lib/auth-client.ts"; // This won't work easily

// Just use fetch directly
async function main() {
  console.log("Sending login request...");
  try {
    const res = await fetch("http://localhost:5000/api/auth/sign-in/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "password123"
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
