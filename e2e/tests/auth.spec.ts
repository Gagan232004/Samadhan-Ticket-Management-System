import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { NavbarPage } from '../pages/NavbarPage';

test.describe('Authentication System', () => {
  let loginPage: LoginPage;
  let navbarPage: NavbarPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    navbarPage = new NavbarPage(page);
  });

  test('should redirect unauthenticated users away from protected routes', async ({ page }) => {
    // Attempting to access protected route /users directly
    await page.goto('/users');
    
    // Should be redirected to /login (because of ProtectedRoute component)
    await expect(page).toHaveURL(/.*\/login/);
    await expect(loginPage.signInButton).toBeVisible();
  });

  test('should login successfully with valid credentials and allow logout', async ({ page }) => {
    await loginPage.goto();
    
    // Use the admin credentials seeded by global.setup.ts
    const email = process.env.ADMIN_EMAIL || 'admin@ticketly.com';
    const password = process.env.ADMIN_PASSWORD || 'SecurePassword123!';
    
    await loginPage.login(email, password);
    
    // After successful login, user should be redirected to home (or dashboard)
    // and navbar should show greeting and Sign Out button
    await expect(page).toHaveURL('/');
    
    // Check Navbar for logged in state
    await expect(navbarPage.greetingText).toBeVisible();
    await expect(navbarPage.greetingText).toContainText('Hello, Admin User');
    await expect(navbarPage.signOutButton).toBeVisible();
    await expect(navbarPage.usersLink).toBeVisible(); // Because user is admin
    
    // Now verify we can access protected route
    await navbarPage.usersLink.click();
    await expect(page).toHaveURL(/.*\/users/);
    
    // Finally, test logout
    await navbarPage.signOut();
    
    // Should be redirected to login page after logout
    await expect(page).toHaveURL(/.*\/login/);
    await expect(navbarPage.loginLink).toBeVisible();
    await expect(navbarPage.signOutButton).not.toBeVisible();
  });

  test('should show validation errors on empty submission', async () => {
    await loginPage.goto();
    await loginPage.login('', '');
    
    await expect(loginPage.emailError).toBeVisible();
    await expect(loginPage.passwordError).toBeVisible();
  });

  test('should show validation error for invalid email format', async () => {
    await loginPage.goto();
    await loginPage.login('invalidemail', 'password123');
    
    await expect(loginPage.emailError).toBeVisible();
  });

  test('should show error message on incorrect credentials', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('admin@ticketly.com', 'WrongPassword123!');
    
    // Check for the error message shown in the UI for incorrect login
    await expect(page.locator('text="Invalid email or password"')).toBeVisible(); // This string depends on backend auth response, standardizing for test. If different, we might need to adjust based on Better Auth. Let's assume 'Invalid email or password'
  });
});

