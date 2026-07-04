import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { UsersPage } from '../pages/UsersPage';
import { NavbarPage } from '../pages/NavbarPage';

test.describe('Users Management System', () => {
  let loginPage: LoginPage;
  let usersPage: UsersPage;
  let navbarPage: NavbarPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    usersPage = new UsersPage(page);
    navbarPage = new NavbarPage(page);
  });

  test('should display the list of users for admin', async ({ page }) => {
    await loginPage.goto();
    
    // Login with admin credentials
    const email = process.env.ADMIN_EMAIL || 'admin@ticketly.com';
    const password = process.env.ADMIN_PASSWORD || 'SecurePassword123!';
    await loginPage.login(email, password);
    
    // Ensure login was successful by checking the navbar
    await expect(navbarPage.signOutButton).toBeVisible();

    // Navigate to users page
    await usersPage.goto();

    // Verify the page loads successfully
    await expect(usersPage.heading).toBeVisible();

    // Verify the table is visible
    await expect(usersPage.table).toBeVisible();
    
    // Wait for the loading row to disappear
    await expect(page.getByText('Loading users...')).toBeHidden({ timeout: 10000 });
    
    // Check that the admin user row is visible in the list
    const adminRow = usersPage.tableRows.filter({ hasText: email });
    await expect(adminRow).toBeVisible();
    
    // Verify row contents
    await expect(adminRow).toContainText('Admin User');
    await expect(adminRow).toContainText(/admin/i); // Role indicator (case insensitive)
  });
});
