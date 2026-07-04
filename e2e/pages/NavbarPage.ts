import { type Locator, type Page } from '@playwright/test';

export class NavbarPage {
  readonly page: Page;
  readonly logoLink: Locator;
  readonly usersLink: Locator;
  readonly signOutButton: Locator;
  readonly loginLink: Locator;
  readonly greetingText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoLink = page.getByRole('link', { name: 'Ticketly' });
    this.usersLink = page.getByRole('link', { name: 'Users' });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
    this.loginLink = page.getByRole('link', { name: 'Login' });
    this.greetingText = page.locator('span:has-text("Hello, ")');
  }

  async signOut() {
    await this.signOutButton.click();
  }
}
