import { test, expect } from '@playwright/test';

test.describe('College Discovery Flow', () => {
  test('User can search for colleges', async ({ page }) => {
    await page.goto('/colleges');
    
    // Wait for the colleges page to load
    await expect(page.locator('h1:has-text("Discover Colleges")')).toBeVisible();
    
    // Type in search box
    await page.fill('input[placeholder="Search colleges by name..."]', 'Pune');
    
    // We expect the searching state or results to show up
    // Just a basic check that the UI doesn't crash
    await expect(page.locator('input[placeholder="Search colleges by name..."]')).toHaveValue('Pune');
  });

  test('AI Matchmaker form renders correctly', async ({ page }) => {
    // Mock the backend API call
    await page.route('/api/ai-match', async route => {
      await route.fulfill({ json: { response: "Mocked AI Response" } });
    });

    await page.goto('/ai-matchmaker');
    
    await expect(page.locator('h1:has-text("AI College Matchmaker")')).toBeVisible();
    
    await page.fill('input[name="city"]', 'Pune');
    await page.fill('input[name="program"]', 'B.Tech');
    await page.fill('input[name="budget"]', '10 Lakhs');
    
    await page.click('button:has-text("Find My Match")');
    
    // Check if the loading state appears
    await expect(page.locator('text=Analyzing...')).toBeVisible();
  });
});
