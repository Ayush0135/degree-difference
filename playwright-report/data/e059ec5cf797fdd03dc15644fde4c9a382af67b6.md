# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: discovery.spec.ts >> College Discovery Flow >> User can search for colleges
- Location: tests/discovery.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1:has-text("Discover Colleges")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1:has-text("Discover Colleges")')

```

```yaml
- navigation:
  - link "Degree Difference":
    - /url: "#/"
  - link "Home":
    - /url: "#/"
  - link "Colleges":
    - /url: "#/colleges"
  - link "AI Matchmaker":
    - /url: "#/ai-matchmaker"
  - link "Login":
    - /url: "#/login"
- main:
  - text: Trusted by 50,000+ students across India
  - heading "Find Your Dream College Today" [level=1]
  - paragraph: Compare 500+ colleges, track applications in real-time, and get expert counseling — all in one powerful platform.
  - textbox "Search colleges, courses, locations..."
  - button "Search"
  - link "Engineering":
    - /url: "#/colleges?type=Engineering"
  - link "Medical":
    - /url: "#/colleges?type=Medical"
  - link "Business":
    - /url: "#/colleges?type=Business"
  - link "Law":
    - /url: "#/colleges?type=Law"
  - link "Arts":
    - /url: "#/colleges?type=Arts"
  - link "Science":
    - /url: "#/colleges?type=Science"
  - img
  - text: 500+ Colleges 50K+ Students Helped 95% Success Rate 24/7 Support
  - img "Students going to college"
  - heading "Confused About Your Future?" [level=2]
  - paragraph: Get free, personalized guidance from our expert admission counselors. We'll help you find the perfect college that matches your goals and budget.
  - text: 1-on-1 career mapping Profile evaluation & college shortlisting End-to-end admission support
  - heading "Request Free Counselling" [level=3]
  - paragraph: Fill out the form below and our experts will call you shortly.
  - text: Full Name
  - textbox
  - text: Phone Number
  - textbox "+91 9876543210"
  - text: Email Address
  - textbox
  - text: What are you looking for?
  - textbox "e.g. Best engineering colleges in Pune under 5 Lakhs"
  - button "Submit Request"
  - text: Why Us
  - heading "All your college prep in one place" [level=2]
  - paragraph: We know how confusing college admissions can be. That's why we built Degree Difference—to give you simple tools and real advice so you can find a college that actually fits you.
  - heading "Smart Search" [level=3]
  - paragraph: Find colleges by what actually matters to you—like placements, fees, and campus life.
  - heading "Live Tracking" [level=3]
  - paragraph: No more guessing. See exactly where your application stands right now.
  - heading "Real Counselors" [level=3]
  - paragraph: Talk to real people who know the system inside out and genuinely want to help.
  - heading "No Fake Data" [level=3]
  - paragraph: We double-check every single detail so you never have to worry about outdated info.
  - img "Indian university campus"
  - heading "Right Guidance, Bright Future" [level=2]
  - paragraph: Guiding lakhs of students and parents to find the right college. Building a better future for India, one student at a time.
  - link "Find Your College":
    - /url: "#/colleges"
  - link "Get Job Ready Degree":
    - /url: "#/colleges"
  - text: How It Works
  - heading "How we help you get there" [level=2]
  - paragraph: We've broken down the stressful admission process into three simple steps. No jargon, no confusion—just a clear path to your dream college.
  - text: "01"
  - heading "Browse & Shortlist" [level=3]
  - paragraph: Look through our verified colleges, compare your favorites, and shortlist the ones that match your vibe and budget.
  - text: "02"
  - heading "Skip the Paperwork" [level=3]
  - paragraph: Submit your application right here. Fill out one simple form, upload your docs, and let us handle the rest.
  - text: "03"
  - heading "Hop on a Call" [level=3]
  - paragraph: Talk to our counselors whenever you feel stuck. We're with you through every round until admission day.
  - heading "Real Stories from Real Students" [level=2]
  - paragraph: See how we've helped thousands of students across India find their perfect college match.
  - paragraph: "\"I was totally lost with the admission process. The counselor guided me step-by-step and helped me secure my seat!\""
  - text: R
  - paragraph: Rahul Sharma
  - paragraph: Amity University
  - paragraph: "\"The smart search saved me hours. I could compare fee structures and cutoffs instantly. Highly recommended!\""
  - text: P
  - paragraph: Priya Patel
  - paragraph: SRM Institute of Science and Technology
  - paragraph: "\"Live tracking is a game changer. I knew exactly where my application was at all times without calling anyone.\""
  - text: A
  - paragraph: Arjun Mehta
  - paragraph: Symbiosis International
  - paragraph: "\"Degree Difference helped me find a college that matched my exact budget and placement expectations. Thank you!\""
  - text: S
  - paragraph: Sneha Gupta
  - paragraph: Lovely Professional University (LPU)
  - paragraph: "\"The verified data gave me so much confidence. I didn't have to worry about fake reviews or outdated fee structures.\""
  - text: K
  - paragraph: Karan Singh
  - paragraph: Chandigarh University
  - paragraph: "\"Skipping the endless paperwork was the best part. I filled out one form and they handled everything else.\""
  - text: A
  - paragraph: Anjali Verma
  - paragraph: KIIT Bhubaneswar
  - paragraph: "\"My counselor was available even on weekends. They really care about where you end up studying.\""
  - text: V
  - paragraph: Vikram Das
  - paragraph: VIT Vellore
  - paragraph: "\"I was aiming for top tier private colleges and the experts here helped me build a profile that got me accepted.\""
  - text: "N"
  - paragraph: Neha Reddy
  - paragraph: Manipal Academy
  - paragraph: "\"It is so easy to use! I shortlisted my top 5 colleges in 10 minutes and applied to all of them the same day.\""
  - text: R
  - paragraph: Rohan Joshi
  - paragraph: Sharda University
  - paragraph: "\"From confusing application deadlines to interview prep, they walked me through everything. Absolutely the best platform.\""
  - text: A
  - paragraph: Aisha Khan
  - paragraph: Christ University
  - paragraph: "\"I didn't know I was eligible for a scholarship until my counselor pointed it out. Saved my parents so much money!\""
  - text: D
  - paragraph: Deepak Nair
  - paragraph: UPES Dehradun
  - paragraph: "\"The interface is beautiful and the support team is genuinely supportive. They truly want you to succeed.\""
  - text: M
  - paragraph: Meera Pillai
  - paragraph: Galgotias University
  - paragraph: "\"I was totally lost with the admission process. The counselor guided me step-by-step and helped me secure my seat!\""
  - text: R
  - paragraph: Rahul Sharma
  - paragraph: Amity University
  - paragraph: "\"The smart search saved me hours. I could compare fee structures and cutoffs instantly. Highly recommended!\""
  - text: P
  - paragraph: Priya Patel
  - paragraph: SRM Institute of Science and Technology
  - paragraph: "\"Live tracking is a game changer. I knew exactly where my application was at all times without calling anyone.\""
  - text: A
  - paragraph: Arjun Mehta
  - paragraph: Symbiosis International
  - paragraph: "\"Degree Difference helped me find a college that matched my exact budget and placement expectations. Thank you!\""
  - text: S
  - paragraph: Sneha Gupta
  - paragraph: Lovely Professional University (LPU)
  - paragraph: "\"The verified data gave me so much confidence. I didn't have to worry about fake reviews or outdated fee structures.\""
  - text: K
  - paragraph: Karan Singh
  - paragraph: Chandigarh University
  - paragraph: "\"Skipping the endless paperwork was the best part. I filled out one form and they handled everything else.\""
  - text: A
  - paragraph: Anjali Verma
  - paragraph: KIIT Bhubaneswar
  - paragraph: "\"My counselor was available even on weekends. They really care about where you end up studying.\""
  - text: V
  - paragraph: Vikram Das
  - paragraph: VIT Vellore
  - paragraph: "\"I was aiming for top tier private colleges and the experts here helped me build a profile that got me accepted.\""
  - text: "N"
  - paragraph: Neha Reddy
  - paragraph: Manipal Academy
  - paragraph: "\"It is so easy to use! I shortlisted my top 5 colleges in 10 minutes and applied to all of them the same day.\""
  - text: R
  - paragraph: Rohan Joshi
  - paragraph: Sharda University
  - paragraph: "\"From confusing application deadlines to interview prep, they walked me through everything. Absolutely the best platform.\""
  - text: A
  - paragraph: Aisha Khan
  - paragraph: Christ University
  - paragraph: "\"I didn't know I was eligible for a scholarship until my counselor pointed it out. Saved my parents so much money!\""
  - text: D
  - paragraph: Deepak Nair
  - paragraph: UPES Dehradun
  - paragraph: "\"The interface is beautiful and the support team is genuinely supportive. They truly want you to succeed.\""
  - text: M
  - paragraph: Meera Pillai
  - paragraph: Galgotias University
  - heading "Ready to Start Your Journey?" [level=2]
  - paragraph: Join thousands of students who found their dream colleges through DegreeDifference
  - link "Explore Colleges":
    - /url: "#/colleges"
- contentinfo:
  - link "DegreeDifference":
    - /url: "#/"
  - paragraph: We're on a mission to simplify college admissions. No jargon, no hidden fees—just honest guidance to help you find where you belong.
  - heading "Explore" [level=3]
  - link "Home":
    - /url: "#/"
  - link "Browse Colleges":
    - /url: "#/colleges"
  - link "Become a Counselor":
    - /url: "#/counselor-registration"
  - link "Student Dashboard":
    - /url: "#/dashboard"
  - link "Counselor Login":
    - /url: "#/login?role=counselor"
  - link "Admin Login":
    - /url: "#/login?role=admin"
  - heading "Disciplines" [level=3]
  - link "Engineering":
    - /url: "#/colleges?type=Engineering"
  - link "Medical Sciences":
    - /url: "#/colleges?type=Medical"
  - link "Business & Management":
    - /url: "#/colleges?type=Business"
  - link "Law & Legal Studies":
    - /url: "#/colleges?type=Law"
  - heading "We're Here For You" [level=3]
  - link "hello@degreedifference.com":
    - /url: mailto:hello@degreedifference.com
  - text: +91 98765 43210 (Mon-Sat, 9AM-6PM) Level 4, TechPark Bengaluru, Karnataka 560001 Built with for students across India. © 2026 We respect your data.
  - link "Privacy Policy":
    - /url: "#/privacy"
  - text: •
  - link "Terms of Service":
    - /url: "#/terms"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('College Discovery Flow', () => {
  4  |   test('User can search for colleges', async ({ page }) => {
  5  |     await page.goto('/colleges');
  6  |     
  7  |     // Wait for the colleges page to load
> 8  |     await expect(page.locator('h1:has-text("Discover Colleges")')).toBeVisible();
     |                                                                    ^ Error: expect(locator).toBeVisible() failed
  9  |     
  10 |     // Type in search box
  11 |     await page.fill('input[placeholder="Search colleges by name..."]', 'Pune');
  12 |     
  13 |     // We expect the searching state or results to show up
  14 |     // Just a basic check that the UI doesn't crash
  15 |     await expect(page.locator('input[placeholder="Search colleges by name..."]')).toHaveValue('Pune');
  16 |   });
  17 | 
  18 |   test('AI Matchmaker form renders correctly', async ({ page }) => {
  19 |     // Mock the backend API call
  20 |     await page.route('/api/ai-match', async route => {
  21 |       await route.fulfill({ json: { response: "Mocked AI Response" } });
  22 |     });
  23 | 
  24 |     await page.goto('/ai-matchmaker');
  25 |     
  26 |     await expect(page.locator('h1:has-text("AI College Matchmaker")')).toBeVisible();
  27 |     
  28 |     await page.fill('input[name="city"]', 'Pune');
  29 |     await page.fill('input[name="program"]', 'B.Tech');
  30 |     await page.fill('input[name="budget"]', '10 Lakhs');
  31 |     
  32 |     await page.click('button:has-text("Find My Match")');
  33 |     
  34 |     // Check if the loading state appears
  35 |     await expect(page.locator('text=Analyzing...')).toBeVisible();
  36 |   });
  37 | });
  38 | 
```