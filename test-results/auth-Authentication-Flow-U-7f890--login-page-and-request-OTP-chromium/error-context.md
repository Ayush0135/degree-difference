# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> User can open login page and request OTP
- Location: tests/auth.spec.ts:4:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="e.g. John"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e6]:
      - link "Degree Difference" [ref=e7] [cursor=pointer]:
        - /url: "#/"
        - img [ref=e9]
        - generic [ref=e12]:
          - generic [ref=e13]: Degree
          - generic [ref=e14]: Difference
      - generic [ref=e15]:
        - link "Home" [ref=e16] [cursor=pointer]:
          - /url: "#/"
        - link "Colleges" [ref=e17] [cursor=pointer]:
          - /url: "#/colleges"
        - link "AI Matchmaker" [ref=e18] [cursor=pointer]:
          - /url: "#/ai-matchmaker"
        - link "Login" [active] [ref=e21] [cursor=pointer]:
          - /url: "#/login"
          - img [ref=e22]
          - text: Login
  - main [ref=e25]:
    - generic [ref=e27]:
      - generic [ref=e28]:
        - generic [ref=e31]:
          - img [ref=e33]
          - heading "Welcome to DegreeDifference" [level=2] [ref=e36]
          - paragraph [ref=e37]: Your gateway to finding the perfect college and achieving your educational dreams.
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e40]: ✓
            - generic [ref=e41]:
              - heading "500+ Colleges" [level=3] [ref=e42]
              - paragraph [ref=e43]: Verified & up-to-date listings
          - generic [ref=e44]:
            - generic [ref=e45]: ✓
            - generic [ref=e46]:
              - heading "Expert Counselors" [level=3] [ref=e47]
              - paragraph [ref=e48]: Personalised guidance at every step
          - generic [ref=e49]:
            - generic [ref=e50]: ✓
            - generic [ref=e51]:
              - heading "Live Tracking" [level=3] [ref=e52]
              - paragraph [ref=e53]: Monitor admission progress in real-time
      - generic [ref=e55]:
        - heading "Student Portal" [level=2] [ref=e56]
        - paragraph [ref=e57]: Sign in or create an account
        - generic [ref=e58]:
          - generic [ref=e59]:
            - generic [ref=e60]: Full Name
            - generic [ref=e61]:
              - img [ref=e62]
              - textbox "John Doe" [ref=e65]
          - generic [ref=e66]:
            - generic [ref=e67]: Email
            - generic [ref=e68]:
              - img [ref=e69]
              - textbox "you@example.com" [ref=e72]
          - button "Continue" [ref=e73]:
            - text: Continue
            - img [ref=e74]
        - generic [ref=e76]:
          - generic [ref=e81]: Or continue with
          - button "Google" [ref=e82]:
            - img [ref=e83]
            - text: Google
  - contentinfo [ref=e88]:
    - generic [ref=e89]:
      - generic [ref=e90]:
        - generic [ref=e91]:
          - link "DegreeDifference" [ref=e92] [cursor=pointer]:
            - /url: "#/"
            - img [ref=e94]
            - generic [ref=e97]: DegreeDifference
          - paragraph [ref=e98]: We're on a mission to simplify college admissions. No jargon, no hidden fees—just honest guidance to help you find where you belong.
        - generic [ref=e99]:
          - heading "Explore" [level=3] [ref=e100]
          - generic [ref=e101]:
            - link "Home" [ref=e102] [cursor=pointer]:
              - /url: "#/"
              - text: Home
            - link "Browse Colleges" [ref=e104] [cursor=pointer]:
              - /url: "#/colleges"
              - text: Browse Colleges
            - link "Become a Counselor" [ref=e106] [cursor=pointer]:
              - /url: "#/counselor-registration"
              - text: Become a Counselor
            - link "Student Dashboard" [ref=e108] [cursor=pointer]:
              - /url: "#/dashboard"
              - text: Student Dashboard
            - link "Counselor Login" [ref=e110] [cursor=pointer]:
              - /url: "#/login?role=counselor"
              - text: Counselor Login
            - link "Admin Login" [ref=e112] [cursor=pointer]:
              - /url: "#/login?role=admin"
              - text: Admin Login
        - generic [ref=e114]:
          - heading "Disciplines" [level=3] [ref=e115]
          - generic [ref=e116]:
            - link "Engineering" [ref=e117] [cursor=pointer]:
              - /url: "#/colleges?type=Engineering"
              - text: Engineering
            - link "Medical Sciences" [ref=e119] [cursor=pointer]:
              - /url: "#/colleges?type=Medical"
              - text: Medical Sciences
            - link "Business & Management" [ref=e121] [cursor=pointer]:
              - /url: "#/colleges?type=Business"
              - text: Business & Management
            - link "Law & Legal Studies" [ref=e123] [cursor=pointer]:
              - /url: "#/colleges?type=Law"
              - text: Law & Legal Studies
        - generic [ref=e125]:
          - heading "We're Here For You" [level=3] [ref=e126]
          - generic [ref=e127]:
            - link "hello@degreedifference.com" [ref=e128] [cursor=pointer]:
              - /url: mailto:hello@degreedifference.com
              - img [ref=e129]
              - generic [ref=e132]: hello@degreedifference.com
            - generic [ref=e133]:
              - img [ref=e134]
              - generic [ref=e136]:
                - text: +91 98765 43210
                - text: (Mon-Sat, 9AM-6PM)
            - generic [ref=e137]:
              - img [ref=e138]
              - generic [ref=e141]:
                - text: Level 4, TechPark
                - text: Bengaluru, Karnataka 560001
      - generic [ref=e142]:
        - generic [ref=e143]:
          - generic [ref=e144]: Built with
          - img [ref=e145]
          - generic [ref=e147]: for students across India. © 2026
        - generic [ref=e148]:
          - generic [ref=e149]: We respect your data.
          - link "Privacy Policy" [ref=e150] [cursor=pointer]:
            - /url: "#/privacy"
          - generic [ref=e151]: •
          - link "Terms of Service" [ref=e152] [cursor=pointer]:
            - /url: "#/terms"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test('User can open login page and request OTP', async ({ page }) => {
  5  |     // Mock the backend API call
  6  |     await page.route('/api/send-otp', async route => {
  7  |       await route.fulfill({ json: { success: true } });
  8  |     });
  9  | 
  10 |     await page.goto('/');
  11 |     
  12 |     // Click on Login button in navigation
  13 |     await page.click('text=Login');
  14 |     
  15 |     // Fill out the login form
> 16 |     await page.fill('input[placeholder="e.g. John"]', 'Test User');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  17 |     await page.fill('input[placeholder="you@example.com"]', 'test@example.com');
  18 |     
  19 |     // Click Get Code
  20 |     await page.click('button:has-text("Get Code")');
  21 |     
  22 |     // Expect the OTP input field to appear
  23 |     await expect(page.locator('text=Enter Verification Code')).toBeVisible();
  24 |     await expect(page.locator('input[placeholder="000000"]')).toBeVisible();
  25 |   });
  26 | });
  27 | 
```