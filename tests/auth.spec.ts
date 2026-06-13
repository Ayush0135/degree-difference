import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('User can open login page and request OTP', async ({ page }) => {
    // Mock the backend API call
    await page.route('/api/send-otp', async route => {
      await route.fulfill({ json: { success: true } });
    });

    await page.goto('/');
    
    // Click on Login button in navigation
    await page.click('text=Login');
    
    // Fill out the login form
    await page.fill('input[placeholder="e.g. John"]', 'Test User');
    await page.fill('input[placeholder="you@example.com"]', 'test@example.com');
    
    // Click Get Code
    await page.click('button:has-text("Get Code")');
    
    // Expect the OTP input field to appear
    await expect(page.locator('text=Enter Verification Code')).toBeVisible();
    await expect(page.locator('input[placeholder="000000"]')).toBeVisible();
  });
});
