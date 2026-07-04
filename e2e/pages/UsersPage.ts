import { type Locator, type Page } from '@playwright/test';

export class UsersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'User Management' });
    this.table = page.locator('table');
    this.tableRows = page.locator('table tbody tr');
  }

  async goto() {
    await this.page.goto('/users');
  }
}
