import { auth } from "./auth.js";
import { prisma } from "./db.js";
import { Role } from "@prisma/client";

async function seed() {
    console.log("Starting seed process...");

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
        process.exit(1);
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        console.log(`Admin user ${email} already exists. Skipping seed.`);
        return;
    }

    console.log("Creating admin user via Better Auth...");
    
    // We temporarily bypass disableSignUp by modifying the options object
    const originalDisableSignUp = auth.options.emailAndPassword?.disableSignUp;
    if (auth.options.emailAndPassword) {
        auth.options.emailAndPassword.disableSignUp = false;
    }

    try {
        const response = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: "Admin User",
                role: Role.admin
            }
        });
        
        console.log("Admin user created successfully!");
    } catch (e) {
        console.error("Error creating admin user:", e);
    } finally {
        // Restore the original configuration
        if (auth.options.emailAndPassword) {
            auth.options.emailAndPassword.disableSignUp = originalDisableSignUp;
        }
    }
}

seed().catch(console.error).finally(() => process.exit(0));
