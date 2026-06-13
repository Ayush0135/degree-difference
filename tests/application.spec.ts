import { test, expect } from '@playwright/test';

// Note: This test mocks local storage to simulate a logged-in user without hitting the OTP backend
test.describe('Application Flow', () => {
  test.use({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:5173',
          localStorage: [
            {
              name: 'auth-storage',
              value: JSON.stringify({
                state: {
                  user: {
                    id: 'test_user_id',
                    name: 'E2E Test User',
                    email: 'e2e@test.com',
                    role: 'student'
                  },
                  isAuthenticated: true
                },
                version: 0
              })
            }
          ]
        }
      ]
    }
  });

  test('Authenticated user can open application modal', async ({ page }) => {
    // Mock the backend API calls so frontend works without Vercel CLI
    await page.route('/api/colleges', async route => {
      await route.fulfill({ 
        json: [{
          id: 'mock_college_1',
          name: 'Mock Engineering College',
          city: 'Pune',
          state: 'Maharashtra',
          location: 'Pune, Maharashtra',
          rating: 4.5,
          established: '2000',
          totalSeats: 120,
          type: 'Engineering',
          fees: { min: 100000, max: 200000 },
          coursesOffered: ['B.Tech'],
          image: '/students_campus.png',
          facilities: ['WiFi']
        }]
      });
    });

    // Navigate to colleges directory
    await page.goto('/colleges');
    
    // Click on the first college card
    await page.click('a[href^="/college/"] >> nth=0');
    
    // Ensure we are on the details page
    await expect(page.locator('button:has-text("Apply Now")')).toBeVisible();
    
    // Click Apply Now
    await page.click('button:has-text("Apply Now")');
    
    // Verify the Application Modal opens
    await expect(page.locator('h3:has-text("Application Form")')).toBeVisible();
    
    // Fill out phone number
    await page.fill('input[name="phone"]', '+919876543210');
    
    // Submit
    await page.click('button:has-text("Submit Application")');
    
    // Check for success screen
    await expect(page.locator('h3:has-text("Application Submitted!")')).toBeVisible();
  });
});
