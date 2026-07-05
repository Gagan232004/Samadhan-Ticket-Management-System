import { test, expect, Page } from '@playwright/test';

class TicketsPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('/tickets');
    await expect(this.page.locator('h1', { hasText: 'Tickets' })).toBeVisible({ timeout: 15000 });
  }

  // Locators
  readonly createTicketBtn = this.page.getByRole('button', { name: /create ticket/i });
  readonly subjectInput = this.page.getByLabel(/subject/i);
  readonly customerNameInput = this.page.getByLabel(/customer name/i);
  readonly customerEmailInput = this.page.getByLabel(/customer email/i);
  readonly categorySelect = this.page.getByRole('combobox').filter({ hasText: 'Category' });
  readonly bodyTextarea = this.page.getByLabel(/message body/i);
  readonly submitBtn = this.page.getByRole('button', { name: /create ticket/i }); // In modal
  readonly tableRows = this.page.locator('tbody tr');

  async createTicket(subject: string, name: string, email: string, body: string, category: string = 'General_Questions') {
    await this.createTicketBtn.click();
    await this.subjectInput.fill(subject);
    await this.customerNameInput.fill(name);
    await this.customerEmailInput.fill(email);
    
    // Select category (assuming native select)
    await this.page.locator('select').first().selectOption(category);
    
    await this.bodyTextarea.fill(body);
    
    // The button inside the modal to submit might be "Create Ticket" or "Save Changes"
    // Let's use the generic form submit if possible, or look for button in dialog
    const modalSubmitBtn = this.page.getByRole('dialog').getByRole('button', { name: /create ticket/i });
    await modalSubmitBtn.click();
    
    // Wait for modal to close
    await expect(this.page.getByRole('dialog')).not.toBeVisible();
  }
}

test.describe('Ticket Management CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Log in as an admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill(adminEmail);
    await page.getByLabel(/password/i).fill(adminPassword);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.locator('h1', { hasText: 'Get started' })).toBeVisible({ timeout: 15000 });
  });

  test('should create tickets and verify they are sorted by newest first', async ({ page }) => {
    const ticketsPage = new TicketsPage(page);
    await ticketsPage.goto();

    const uniqueId1 = Date.now();
    const subject1 = `Older Ticket ${uniqueId1}`;
    
    // Create first ticket
    await ticketsPage.createTicket(
      subject1,
      'Alice',
      'alice@example.com',
      'This is the first ticket.',
      'General_Questions'
    );
    
    // Ensure it appears
    await expect(page.locator('td').filter({ hasText: subject1 })).toBeVisible();

    // Wait a second to ensure createdAt timestamps are distinctly different
    await page.waitForTimeout(1000);

    const uniqueId2 = Date.now();
    const subject2 = `Newer Ticket ${uniqueId2}`;
    
    // Create second ticket
    await ticketsPage.createTicket(
      subject2,
      'Bob',
      'bob@example.com',
      'This is the second ticket.',
      'Technical_Questions'
    );
    
    // Ensure it appears
    await expect(page.locator('td').filter({ hasText: subject2 })).toBeVisible();

    // Verify sort order: newer ticket should be above older ticket
    // Wait for the table to stop rendering skeletons
    await expect(ticketsPage.tableRows.first()).not.toHaveClass(/animate-pulse/);

    const firstRowText = await ticketsPage.tableRows.nth(0).innerText();
    const secondRowText = await ticketsPage.tableRows.nth(1).innerText();
    
    // Since the table sorts by newest first, the Newer Ticket should be in the first row
    expect(firstRowText).toContain(subject2);
    expect(secondRowText).toContain(subject1);
  });
});
