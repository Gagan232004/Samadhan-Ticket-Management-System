import { type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly header: Locator;
  readonly counterBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.getByRole('heading', { name: 'Get started' });
    this.counterBtn = page.getByRole('button', { name: /Count is/ });
  }

  async goto() {
    await this.page.goto('/');
  }

  async incrementCount() {
    await this.counterBtn.click();
  }
}
