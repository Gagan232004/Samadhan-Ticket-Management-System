import { test, expect } from '@playwright/test';

test.describe('Webhook Ticket Ingestion', () => {
  const uniqueId = Date.now();
  const testTicket = {
    subject: `Webhook E2E Test ${uniqueId}`,
    body: `This is an automated E2E test body for ticket ${uniqueId}.`,
    customerName: `Webhook User ${uniqueId}`,
    customerEmail: `webhook${uniqueId}@example.com`,
    category: 'General Questions'
  };

  test('should create a ticket via webhook and display it in the UI', async ({ page, request }) => {
    // 1. Send the Webhook POST request directly to the backend
    const webhookUrl = 'http://localhost:5000/api/webhooks/tickets';
    const webhookSecret = process.env.WEBHOOK_SECRET || 'my-super-secret-token';
    
    const response = await request.post(webhookUrl, {
      headers: {
        'x-webhook-secret': webhookSecret,
      },
      data: testTicket
    });

    // Assert webhook succeeded
    expect(response.status()).toBe(201);
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.ticketId).toBeDefined();

    // 2. Log into the frontend to verify the ticket appears in the UI
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    
    await page.goto('/login');
    await page.getByLabel(/email address/i).fill(adminEmail);
    await page.getByLabel(/password/i).fill(adminPassword);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for successful login (Home screen)
    await expect(page.locator('h1', { hasText: 'Get started' })).toBeVisible({ timeout: 15000 });

    // Navigate to Tickets page
    await page.goto('/tickets');
    await expect(page.locator('h1', { hasText: 'Tickets' })).toBeVisible({ timeout: 15000 });

    // 3. Verify the ticket appears in the table
    // The subject and customer email should be visible in the table row
    const ticketRow = page.locator('tr').filter({ hasText: testTicket.subject });
    await expect(ticketRow).toBeVisible({ timeout: 15000 });
    await expect(ticketRow).toContainText(testTicket.customerEmail);
    await expect(ticketRow).toContainText('Open'); // Status should default to Open
  });

  test('should reject webhook without valid secret', async ({ request }) => {
    const webhookUrl = 'http://localhost:5000/api/webhooks/tickets';
    
    const response = await request.post(webhookUrl, {
      headers: {
        'x-webhook-secret': 'invalid-secret',
      },
      data: testTicket
    });

    // Assert webhook was rejected
    expect(response.status()).toBe(401);
  });
});
