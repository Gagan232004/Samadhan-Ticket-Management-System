import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Home page flow', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display initial elements and increment counter', async () => {
    // Check if main header is visible
    await expect(homePage.header).toBeVisible();
    
    // Check initial counter value
    await expect(homePage.counterBtn).toHaveText('Count is 0');
    
    // Click counter and check updated value
    await homePage.incrementCount();
    await expect(homePage.counterBtn).toHaveText('Count is 1');
    
    // Click counter again
    await homePage.incrementCount();
    await expect(homePage.counterBtn).toHaveText('Count is 2');
  });
});
