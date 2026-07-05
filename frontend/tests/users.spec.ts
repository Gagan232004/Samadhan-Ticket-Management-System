import { test, expect, Page } from '@playwright/test';

class UsersPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('/users');
  }

  // Locators
  readonly createUserBtn = this.page.getByRole('button', { name: /create user/i });
  readonly nameInput = this.page.getByLabel(/^Name$/i);
  readonly emailInput = this.page.getByLabel(/^Email$/i);
  readonly passwordInput = this.page.getByLabel(/password/i);
  readonly submitBtn = this.page.locator('button[type="submit"]');
  readonly deleteConfirmBtn = this.page.getByRole('button', { name: /yes, delete user/i });

  async createUser(name: string, email: string) {
    await this.createUserBtn.click();
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill('SecurePassword123!');
    await this.submitBtn.click();
  }

  async editUser(email: string, newName: string) {
    const row = this.page.locator('tr').filter({ hasText: email });
    const editBtn = row.getByTitle('Edit User');
    await editBtn.click();
    
    // Clear and fill new name
    await this.nameInput.fill(newName);
    // Submit changes (button name should be Save Changes in EditModal)
    await this.page.getByRole('button', { name: /save changes/i }).click();
  }

  async deleteUser(email: string) {
    const row = this.page.locator('tr').filter({ hasText: email });
    const deleteBtn = row.getByTitle('Delete User');
    await deleteBtn.click();
    
    // Confirm delete
    await this.deleteConfirmBtn.click();
  }
}

test.describe('User Management CRUD', () => {
  // Use a unique email for each test run to avoid collisions
  const uniqueId = Date.now();
  const testUser = {
    name: `Test User ${uniqueId}`,
    email: `test${uniqueId}@example.com`,
    newName: `Updated User ${uniqueId}`
  };

  test.beforeEach(async ({ page }) => {
    // 1. Log in as an admin
    // Replace these credentials with valid admin credentials in your testing environment
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));
    
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill(adminEmail);
    await page.getByLabel(/password/i).fill(adminPassword);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait a moment for network or rendering
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'login-debug.png' });

    // If login fails, an error appears on the screen. 
    // We wait for the Home title, which means we reached the dashboard.
    await expect(page.locator('h1', { hasText: 'Get started' })).toBeVisible({ timeout: 15000 });

    // 2. Navigate to users page
    const usersPage = new UsersPage(page);
    await usersPage.goto(); 
    await expect(page.locator('h1', { hasText: 'User Management' })).toBeVisible({ timeout: 15000 });
  });

  test('should create a new user successfully', async ({ page }) => {
    const usersPage = new UsersPage(page);
    
    // Create user
    await usersPage.createUser(testUser.name, testUser.email);
    
    // Verify user is in the list
    await expect(page.locator('td').filter({ hasText: testUser.email })).toBeVisible();
    await expect(page.locator('td').filter({ hasText: testUser.name })).toBeVisible();
  });

  test('should read the newly created user from the list', async ({ page }) => {
    // Assuming the user created from previous steps is visible or we recreate
    // For robust tests, each test should be independent. Let's create one first:
    const usersPage = new UsersPage(page);
    const localId = Date.now();
    await usersPage.createUser(`Read User ${localId}`, `read${localId}@example.com`);
    
    // Read operation verification
    const row = page.locator('tr').filter({ hasText: `read${localId}@example.com` });
    await expect(row).toBeVisible();
    await expect(row.locator('td').nth(0)).toContainText(`Read User ${localId}`);
  });

  test('should edit an existing user successfully', async ({ page }) => {
    const usersPage = new UsersPage(page);
    const localId = Date.now();
    const originalEmail = `edit${localId}@example.com`;
    
    // Setup: Create user first
    await usersPage.createUser(`Edit User ${localId}`, originalEmail);
    await expect(page.getByText(originalEmail)).toBeVisible();

    // Edit user
    const updatedName = `Updated Edit User ${localId}`;
    await usersPage.editUser(originalEmail, updatedName);

    // Verify changes
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test('should soft delete a user successfully', async ({ page }) => {
    const usersPage = new UsersPage(page);
    const localId = Date.now();
    const deleteEmail = `delete${localId}@example.com`;

    // Setup: Create user first
    await usersPage.createUser(`Delete User ${localId}`, deleteEmail);
    await expect(page.getByText(deleteEmail)).toBeVisible();

    // Soft delete user
    await usersPage.deleteUser(deleteEmail);

    // Verify user is removed from the table
    await expect(page.getByRole('cell', { name: deleteEmail })).not.toBeVisible();
  });
});
