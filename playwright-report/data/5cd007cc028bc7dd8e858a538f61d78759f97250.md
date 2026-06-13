# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: application.spec.ts >> Application Flow >> Authenticated user can open application modal
- Location: tests/application.spec.ts:33:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a[href^="/college/"]').first()

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
        - link "AI Matchmaker" [ref=e16] [cursor=pointer]:
          - /url: "#/ai-matchmaker"
        - link "Dashboard" [ref=e17] [cursor=pointer]:
          - /url: "#/dashboard"
        - generic [ref=e19]:
          - generic [ref=e20]:
            - generic [ref=e21]: E
            - generic [ref=e22]: E2E Test User
          - button "Logout" [ref=e23]:
            - img [ref=e24]
            - text: Logout
  - main [ref=e27]:
    - generic [ref=e28]:
      - generic [ref=e29]:
        - generic [ref=e32]:
          - generic [ref=e33]:
            - img [ref=e34]
            - generic [ref=e37]: Trusted by 50,000+ students across India
          - heading "Find Your Dream College Today" [level=1] [ref=e38]:
            - text: Find Your Dream
            - text: College Today
          - paragraph [ref=e39]: Compare 500+ colleges, track applications in real-time, and get expert counseling — all in one powerful platform.
          - generic [ref=e43]:
            - img [ref=e44]
            - textbox "Search colleges, courses, locations..." [ref=e47]
            - button "Search" [ref=e48]
          - generic [ref=e49]:
            - link "Engineering" [ref=e51] [cursor=pointer]:
              - /url: "#/colleges?type=Engineering"
            - link "Medical" [ref=e53] [cursor=pointer]:
              - /url: "#/colleges?type=Medical"
            - link "Business" [ref=e55] [cursor=pointer]:
              - /url: "#/colleges?type=Business"
            - link "Law" [ref=e57] [cursor=pointer]:
              - /url: "#/colleges?type=Law"
            - link "Arts" [ref=e59] [cursor=pointer]:
              - /url: "#/colleges?type=Arts"
            - link "Science" [ref=e61] [cursor=pointer]:
              - /url: "#/colleges?type=Science"
        - img [ref=e63]
      - generic [ref=e67]:
        - generic [ref=e68]:
          - generic [ref=e69]: 500+
          - generic [ref=e70]: Colleges
        - generic [ref=e71]:
          - generic [ref=e72]: 50K+
          - generic [ref=e73]: Students Helped
        - generic [ref=e74]:
          - generic [ref=e75]: 95%
          - generic [ref=e76]: Success Rate
        - generic [ref=e77]:
          - generic [ref=e78]: 24/7
          - generic [ref=e79]: Support
      - generic [ref=e80]:
        - img "Students going to college" [ref=e82]
        - generic [ref=e85]:
          - generic [ref=e86]:
            - heading "Confused About Your Future?" [level=2] [ref=e87]
            - paragraph [ref=e88]: Get free, personalized guidance from our expert admission counselors. We'll help you find the perfect college that matches your goals and budget.
            - generic [ref=e89]:
              - generic [ref=e90]:
                - img [ref=e92]
                - generic [ref=e95]: 1-on-1 career mapping
              - generic [ref=e96]:
                - img [ref=e98]
                - generic [ref=e101]: Profile evaluation & college shortlisting
              - generic [ref=e102]:
                - img [ref=e104]
                - generic [ref=e107]: End-to-end admission support
          - generic [ref=e108]:
            - heading "Request Free Counselling" [level=3] [ref=e109]
            - paragraph [ref=e110]: Fill out the form below and our experts will call you shortly.
            - generic [ref=e111]:
              - generic [ref=e112]:
                - generic [ref=e113]:
                  - generic [ref=e114]: Full Name
                  - textbox [ref=e115]: E2E Test User
                - generic [ref=e116]:
                  - generic [ref=e117]: Phone Number
                  - textbox "+91 9876543210" [ref=e118]
              - generic [ref=e119]:
                - generic [ref=e120]: Email Address
                - textbox [ref=e121]: e2e@test.com
              - generic [ref=e122]:
                - generic [ref=e123]: What are you looking for?
                - textbox "e.g. Best engineering colleges in Pune under 5 Lakhs" [ref=e124]
              - button "Submit Request" [ref=e125]
      - generic [ref=e129]:
        - generic [ref=e130]:
          - generic [ref=e131]: Why Us
          - heading "All your college prep in one place" [level=2] [ref=e132]:
            - text: All your college prep
            - text: in one place
          - paragraph [ref=e133]: We know how confusing college admissions can be. That's why we built Degree Difference—to give you simple tools and real advice so you can find a college that actually fits you.
        - generic [ref=e134]:
          - generic [ref=e135]:
            - img [ref=e137]
            - heading "Smart Search" [level=3] [ref=e140]
            - paragraph [ref=e141]: Find colleges by what actually matters to you—like placements, fees, and campus life.
          - generic [ref=e142]:
            - img [ref=e144]
            - heading "Live Tracking" [level=3] [ref=e147]
            - paragraph [ref=e148]: No more guessing. See exactly where your application stands right now.
          - generic [ref=e149]:
            - img [ref=e151]
            - heading "Real Counselors" [level=3] [ref=e156]
            - paragraph [ref=e157]: Talk to real people who know the system inside out and genuinely want to help.
          - generic [ref=e158]:
            - img [ref=e160]
            - heading "No Fake Data" [level=3] [ref=e162]
            - paragraph [ref=e163]: We double-check every single detail so you never have to worry about outdated info.
      - generic [ref=e164]:
        - img "Indian university campus" [ref=e166]
        - generic [ref=e169]:
          - heading "Right Guidance, Bright Future" [level=2] [ref=e170]
          - paragraph [ref=e171]: Guiding lakhs of students and parents to find the right college. Building a better future for India, one student at a time.
          - generic [ref=e172]:
            - link "Find Your College" [ref=e173] [cursor=pointer]:
              - /url: "#/colleges"
            - link "Get Job Ready Degree" [ref=e174] [cursor=pointer]:
              - /url: "#/colleges"
      - generic [ref=e178]:
        - generic [ref=e179]:
          - generic [ref=e180]: How It Works
          - heading "How we help you get there" [level=2] [ref=e181]:
            - text: How we help you
            - text: get there
          - paragraph [ref=e182]: We've broken down the stressful admission process into three simple steps. No jargon, no confusion—just a clear path to your dream college.
        - generic [ref=e183]:
          - generic [ref=e184]:
            - generic: "01"
            - img [ref=e186]
            - generic [ref=e188]:
              - heading "Browse & Shortlist" [level=3] [ref=e189]
              - paragraph [ref=e190]: Look through our verified colleges, compare your favorites, and shortlist the ones that match your vibe and budget.
          - generic [ref=e191]:
            - generic: "02"
            - img [ref=e193]
            - generic [ref=e196]:
              - heading "Skip the Paperwork" [level=3] [ref=e197]
              - paragraph [ref=e198]: Submit your application right here. Fill out one simple form, upload your docs, and let us handle the rest.
          - generic [ref=e199]:
            - generic: "03"
            - img [ref=e201]
            - generic [ref=e204]:
              - heading "Hop on a Call" [level=3] [ref=e205]
              - paragraph [ref=e206]: Talk to our counselors whenever you feel stuck. We're with you through every round until admission day.
      - generic [ref=e207]:
        - generic [ref=e209]:
          - heading "Real Stories from Real Students" [level=2] [ref=e210]
          - paragraph [ref=e211]: See how we've helped thousands of students across India find their perfect college match.
        - generic [ref=e213]:
          - generic [ref=e214]:
            - generic [ref=e215]:
              - generic [ref=e216]:
                - img [ref=e217]
                - img [ref=e219]
                - img [ref=e221]
                - img [ref=e223]
                - img [ref=e225]
              - paragraph [ref=e227]: "\"I was totally lost with the admission process. The counselor guided me step-by-step and helped me secure my seat!\""
            - generic [ref=e228]:
              - generic [ref=e229]: R
              - generic [ref=e230]:
                - paragraph [ref=e231]: Rahul Sharma
                - paragraph [ref=e232]: Amity University
          - generic [ref=e233]:
            - generic [ref=e234]:
              - generic [ref=e235]:
                - img [ref=e236]
                - img [ref=e238]
                - img [ref=e240]
                - img [ref=e242]
                - img [ref=e244]
              - paragraph [ref=e246]: "\"The smart search saved me hours. I could compare fee structures and cutoffs instantly. Highly recommended!\""
            - generic [ref=e247]:
              - generic [ref=e248]: P
              - generic [ref=e249]:
                - paragraph [ref=e250]: Priya Patel
                - paragraph [ref=e251]: SRM Institute of Science and Technology
          - generic [ref=e252]:
            - generic [ref=e253]:
              - generic [ref=e254]:
                - img [ref=e255]
                - img [ref=e257]
                - img [ref=e259]
                - img [ref=e261]
                - img [ref=e263]
              - paragraph [ref=e265]: "\"Live tracking is a game changer. I knew exactly where my application was at all times without calling anyone.\""
            - generic [ref=e266]:
              - generic [ref=e267]: A
              - generic [ref=e268]:
                - paragraph [ref=e269]: Arjun Mehta
                - paragraph [ref=e270]: Symbiosis International
          - generic [ref=e271]:
            - generic [ref=e272]:
              - generic [ref=e273]:
                - img [ref=e274]
                - img [ref=e276]
                - img [ref=e278]
                - img [ref=e280]
                - img [ref=e282]
              - paragraph [ref=e284]: "\"Degree Difference helped me find a college that matched my exact budget and placement expectations. Thank you!\""
            - generic [ref=e285]:
              - generic [ref=e286]: S
              - generic [ref=e287]:
                - paragraph [ref=e288]: Sneha Gupta
                - paragraph [ref=e289]: Lovely Professional University (LPU)
          - generic [ref=e290]:
            - generic [ref=e291]:
              - generic [ref=e292]:
                - img [ref=e293]
                - img [ref=e295]
                - img [ref=e297]
                - img [ref=e299]
                - img [ref=e301]
              - paragraph [ref=e303]: "\"The verified data gave me so much confidence. I didn't have to worry about fake reviews or outdated fee structures.\""
            - generic [ref=e304]:
              - generic [ref=e305]: K
              - generic [ref=e306]:
                - paragraph [ref=e307]: Karan Singh
                - paragraph [ref=e308]: Chandigarh University
          - generic [ref=e309]:
            - generic [ref=e310]:
              - generic [ref=e311]:
                - img [ref=e312]
                - img [ref=e314]
                - img [ref=e316]
                - img [ref=e318]
                - img [ref=e320]
              - paragraph [ref=e322]: "\"Skipping the endless paperwork was the best part. I filled out one form and they handled everything else.\""
            - generic [ref=e323]:
              - generic [ref=e324]: A
              - generic [ref=e325]:
                - paragraph [ref=e326]: Anjali Verma
                - paragraph [ref=e327]: KIIT Bhubaneswar
          - generic [ref=e328]:
            - generic [ref=e329]:
              - generic [ref=e330]:
                - img [ref=e331]
                - img [ref=e333]
                - img [ref=e335]
                - img [ref=e337]
                - img [ref=e339]
              - paragraph [ref=e341]: "\"My counselor was available even on weekends. They really care about where you end up studying.\""
            - generic [ref=e342]:
              - generic [ref=e343]: V
              - generic [ref=e344]:
                - paragraph [ref=e345]: Vikram Das
                - paragraph [ref=e346]: VIT Vellore
          - generic [ref=e347]:
            - generic [ref=e348]:
              - generic [ref=e349]:
                - img [ref=e350]
                - img [ref=e352]
                - img [ref=e354]
                - img [ref=e356]
                - img [ref=e358]
              - paragraph [ref=e360]: "\"I was aiming for top tier private colleges and the experts here helped me build a profile that got me accepted.\""
            - generic [ref=e361]:
              - generic [ref=e362]: "N"
              - generic [ref=e363]:
                - paragraph [ref=e364]: Neha Reddy
                - paragraph [ref=e365]: Manipal Academy
          - generic [ref=e366]:
            - generic [ref=e367]:
              - generic [ref=e368]:
                - img [ref=e369]
                - img [ref=e371]
                - img [ref=e373]
                - img [ref=e375]
                - img [ref=e377]
              - paragraph [ref=e379]: "\"It is so easy to use! I shortlisted my top 5 colleges in 10 minutes and applied to all of them the same day.\""
            - generic [ref=e380]:
              - generic [ref=e381]: R
              - generic [ref=e382]:
                - paragraph [ref=e383]: Rohan Joshi
                - paragraph [ref=e384]: Sharda University
          - generic [ref=e385]:
            - generic [ref=e386]:
              - generic [ref=e387]:
                - img [ref=e388]
                - img [ref=e390]
                - img [ref=e392]
                - img [ref=e394]
                - img [ref=e396]
              - paragraph [ref=e398]: "\"From confusing application deadlines to interview prep, they walked me through everything. Absolutely the best platform.\""
            - generic [ref=e399]:
              - generic [ref=e400]: A
              - generic [ref=e401]:
                - paragraph [ref=e402]: Aisha Khan
                - paragraph [ref=e403]: Christ University
          - generic [ref=e404]:
            - generic [ref=e405]:
              - generic [ref=e406]:
                - img [ref=e407]
                - img [ref=e409]
                - img [ref=e411]
                - img [ref=e413]
                - img [ref=e415]
              - paragraph [ref=e417]: "\"I didn't know I was eligible for a scholarship until my counselor pointed it out. Saved my parents so much money!\""
            - generic [ref=e418]:
              - generic [ref=e419]: D
              - generic [ref=e420]:
                - paragraph [ref=e421]: Deepak Nair
                - paragraph [ref=e422]: UPES Dehradun
          - generic [ref=e423]:
            - generic [ref=e424]:
              - generic [ref=e425]:
                - img [ref=e426]
                - img [ref=e428]
                - img [ref=e430]
                - img [ref=e432]
                - img [ref=e434]
              - paragraph [ref=e436]: "\"The interface is beautiful and the support team is genuinely supportive. They truly want you to succeed.\""
            - generic [ref=e437]:
              - generic [ref=e438]: M
              - generic [ref=e439]:
                - paragraph [ref=e440]: Meera Pillai
                - paragraph [ref=e441]: Galgotias University
          - generic [ref=e442]:
            - generic [ref=e443]:
              - generic [ref=e444]:
                - img [ref=e445]
                - img [ref=e447]
                - img [ref=e449]
                - img [ref=e451]
                - img [ref=e453]
              - paragraph [ref=e455]: "\"I was totally lost with the admission process. The counselor guided me step-by-step and helped me secure my seat!\""
            - generic [ref=e456]:
              - generic [ref=e457]: R
              - generic [ref=e458]:
                - paragraph [ref=e459]: Rahul Sharma
                - paragraph [ref=e460]: Amity University
          - generic [ref=e461]:
            - generic [ref=e462]:
              - generic [ref=e463]:
                - img [ref=e464]
                - img [ref=e466]
                - img [ref=e468]
                - img [ref=e470]
                - img [ref=e472]
              - paragraph [ref=e474]: "\"The smart search saved me hours. I could compare fee structures and cutoffs instantly. Highly recommended!\""
            - generic [ref=e475]:
              - generic [ref=e476]: P
              - generic [ref=e477]:
                - paragraph [ref=e478]: Priya Patel
                - paragraph [ref=e479]: SRM Institute of Science and Technology
          - generic [ref=e480]:
            - generic [ref=e481]:
              - generic [ref=e482]:
                - img [ref=e483]
                - img [ref=e485]
                - img [ref=e487]
                - img [ref=e489]
                - img [ref=e491]
              - paragraph [ref=e493]: "\"Live tracking is a game changer. I knew exactly where my application was at all times without calling anyone.\""
            - generic [ref=e494]:
              - generic [ref=e495]: A
              - generic [ref=e496]:
                - paragraph [ref=e497]: Arjun Mehta
                - paragraph [ref=e498]: Symbiosis International
          - generic [ref=e499]:
            - generic [ref=e500]:
              - generic [ref=e501]:
                - img [ref=e502]
                - img [ref=e504]
                - img [ref=e506]
                - img [ref=e508]
                - img [ref=e510]
              - paragraph [ref=e512]: "\"Degree Difference helped me find a college that matched my exact budget and placement expectations. Thank you!\""
            - generic [ref=e513]:
              - generic [ref=e514]: S
              - generic [ref=e515]:
                - paragraph [ref=e516]: Sneha Gupta
                - paragraph [ref=e517]: Lovely Professional University (LPU)
          - generic [ref=e518]:
            - generic [ref=e519]:
              - generic [ref=e520]:
                - img [ref=e521]
                - img [ref=e523]
                - img [ref=e525]
                - img [ref=e527]
                - img [ref=e529]
              - paragraph [ref=e531]: "\"The verified data gave me so much confidence. I didn't have to worry about fake reviews or outdated fee structures.\""
            - generic [ref=e532]:
              - generic [ref=e533]: K
              - generic [ref=e534]:
                - paragraph [ref=e535]: Karan Singh
                - paragraph [ref=e536]: Chandigarh University
          - generic [ref=e537]:
            - generic [ref=e538]:
              - generic [ref=e539]:
                - img [ref=e540]
                - img [ref=e542]
                - img [ref=e544]
                - img [ref=e546]
                - img [ref=e548]
              - paragraph [ref=e550]: "\"Skipping the endless paperwork was the best part. I filled out one form and they handled everything else.\""
            - generic [ref=e551]:
              - generic [ref=e552]: A
              - generic [ref=e553]:
                - paragraph [ref=e554]: Anjali Verma
                - paragraph [ref=e555]: KIIT Bhubaneswar
          - generic [ref=e556]:
            - generic [ref=e557]:
              - generic [ref=e558]:
                - img [ref=e559]
                - img [ref=e561]
                - img [ref=e563]
                - img [ref=e565]
                - img [ref=e567]
              - paragraph [ref=e569]: "\"My counselor was available even on weekends. They really care about where you end up studying.\""
            - generic [ref=e570]:
              - generic [ref=e571]: V
              - generic [ref=e572]:
                - paragraph [ref=e573]: Vikram Das
                - paragraph [ref=e574]: VIT Vellore
          - generic [ref=e575]:
            - generic [ref=e576]:
              - generic [ref=e577]:
                - img [ref=e578]
                - img [ref=e580]
                - img [ref=e582]
                - img [ref=e584]
                - img [ref=e586]
              - paragraph [ref=e588]: "\"I was aiming for top tier private colleges and the experts here helped me build a profile that got me accepted.\""
            - generic [ref=e589]:
              - generic [ref=e590]: "N"
              - generic [ref=e591]:
                - paragraph [ref=e592]: Neha Reddy
                - paragraph [ref=e593]: Manipal Academy
          - generic [ref=e594]:
            - generic [ref=e595]:
              - generic [ref=e596]:
                - img [ref=e597]
                - img [ref=e599]
                - img [ref=e601]
                - img [ref=e603]
                - img [ref=e605]
              - paragraph [ref=e607]: "\"It is so easy to use! I shortlisted my top 5 colleges in 10 minutes and applied to all of them the same day.\""
            - generic [ref=e608]:
              - generic [ref=e609]: R
              - generic [ref=e610]:
                - paragraph [ref=e611]: Rohan Joshi
                - paragraph [ref=e612]: Sharda University
          - generic [ref=e613]:
            - generic [ref=e614]:
              - generic [ref=e615]:
                - img [ref=e616]
                - img [ref=e618]
                - img [ref=e620]
                - img [ref=e622]
                - img [ref=e624]
              - paragraph [ref=e626]: "\"From confusing application deadlines to interview prep, they walked me through everything. Absolutely the best platform.\""
            - generic [ref=e627]:
              - generic [ref=e628]: A
              - generic [ref=e629]:
                - paragraph [ref=e630]: Aisha Khan
                - paragraph [ref=e631]: Christ University
          - generic [ref=e632]:
            - generic [ref=e633]:
              - generic [ref=e634]:
                - img [ref=e635]
                - img [ref=e637]
                - img [ref=e639]
                - img [ref=e641]
                - img [ref=e643]
              - paragraph [ref=e645]: "\"I didn't know I was eligible for a scholarship until my counselor pointed it out. Saved my parents so much money!\""
            - generic [ref=e646]:
              - generic [ref=e647]: D
              - generic [ref=e648]:
                - paragraph [ref=e649]: Deepak Nair
                - paragraph [ref=e650]: UPES Dehradun
          - generic [ref=e651]:
            - generic [ref=e652]:
              - generic [ref=e653]:
                - img [ref=e654]
                - img [ref=e656]
                - img [ref=e658]
                - img [ref=e660]
                - img [ref=e662]
              - paragraph [ref=e664]: "\"The interface is beautiful and the support team is genuinely supportive. They truly want you to succeed.\""
            - generic [ref=e665]:
              - generic [ref=e666]: M
              - generic [ref=e667]:
                - paragraph [ref=e668]: Meera Pillai
                - paragraph [ref=e669]: Galgotias University
      - generic [ref=e673]:
        - img [ref=e678]
        - heading "Ready to Start Your Journey?" [level=2] [ref=e681]:
          - text: Ready to Start Your
          - text: Journey?
        - paragraph [ref=e682]: Join thousands of students who found their dream colleges through DegreeDifference
        - link "Explore Colleges" [ref=e685] [cursor=pointer]:
          - /url: "#/colleges"
          - generic [ref=e686]: Explore Colleges
          - img [ref=e687]
  - contentinfo [ref=e690]:
    - generic [ref=e691]:
      - generic [ref=e692]:
        - generic [ref=e693]:
          - link "DegreeDifference" [ref=e694] [cursor=pointer]:
            - /url: "#/"
            - img [ref=e696]
            - generic [ref=e699]: DegreeDifference
          - paragraph [ref=e700]: We're on a mission to simplify college admissions. No jargon, no hidden fees—just honest guidance to help you find where you belong.
        - generic [ref=e701]:
          - heading "Explore" [level=3] [ref=e702]
          - generic [ref=e703]:
            - link "Home" [ref=e704] [cursor=pointer]:
              - /url: "#/"
              - text: Home
            - link "Browse Colleges" [ref=e706] [cursor=pointer]:
              - /url: "#/colleges"
              - text: Browse Colleges
            - link "Become a Counselor" [ref=e708] [cursor=pointer]:
              - /url: "#/counselor-registration"
              - text: Become a Counselor
            - link "Student Dashboard" [ref=e710] [cursor=pointer]:
              - /url: "#/dashboard"
              - text: Student Dashboard
            - link "Counselor Login" [ref=e712] [cursor=pointer]:
              - /url: "#/login?role=counselor"
              - text: Counselor Login
            - link "Admin Login" [ref=e714] [cursor=pointer]:
              - /url: "#/login?role=admin"
              - text: Admin Login
        - generic [ref=e716]:
          - heading "Disciplines" [level=3] [ref=e717]
          - generic [ref=e718]:
            - link "Engineering" [ref=e719] [cursor=pointer]:
              - /url: "#/colleges?type=Engineering"
              - text: Engineering
            - link "Medical Sciences" [ref=e721] [cursor=pointer]:
              - /url: "#/colleges?type=Medical"
              - text: Medical Sciences
            - link "Business & Management" [ref=e723] [cursor=pointer]:
              - /url: "#/colleges?type=Business"
              - text: Business & Management
            - link "Law & Legal Studies" [ref=e725] [cursor=pointer]:
              - /url: "#/colleges?type=Law"
              - text: Law & Legal Studies
        - generic [ref=e727]:
          - heading "We're Here For You" [level=3] [ref=e728]
          - generic [ref=e729]:
            - link "hello@degreedifference.com" [ref=e730] [cursor=pointer]:
              - /url: mailto:hello@degreedifference.com
              - img [ref=e731]
              - generic [ref=e734]: hello@degreedifference.com
            - generic [ref=e735]:
              - img [ref=e736]
              - generic [ref=e738]:
                - text: +91 98765 43210
                - text: (Mon-Sat, 9AM-6PM)
            - generic [ref=e739]:
              - img [ref=e740]
              - generic [ref=e743]:
                - text: Level 4, TechPark
                - text: Bengaluru, Karnataka 560001
      - generic [ref=e744]:
        - generic [ref=e745]:
          - generic [ref=e746]: Built with
          - img [ref=e747]
          - generic [ref=e749]: for students across India. © 2026
        - generic [ref=e750]:
          - generic [ref=e751]: We respect your data.
          - link "Privacy Policy" [ref=e752] [cursor=pointer]:
            - /url: "#/privacy"
          - generic [ref=e753]: •
          - link "Terms of Service" [ref=e754] [cursor=pointer]:
            - /url: "#/terms"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Note: This test mocks local storage to simulate a logged-in user without hitting the OTP backend
  4  | test.describe('Application Flow', () => {
  5  |   test.use({
  6  |     storageState: {
  7  |       cookies: [],
  8  |       origins: [
  9  |         {
  10 |           origin: 'http://localhost:5173',
  11 |           localStorage: [
  12 |             {
  13 |               name: 'auth-storage',
  14 |               value: JSON.stringify({
  15 |                 state: {
  16 |                   user: {
  17 |                     id: 'test_user_id',
  18 |                     name: 'E2E Test User',
  19 |                     email: 'e2e@test.com',
  20 |                     role: 'student'
  21 |                   },
  22 |                   isAuthenticated: true
  23 |                 },
  24 |                 version: 0
  25 |               })
  26 |             }
  27 |           ]
  28 |         }
  29 |       ]
  30 |     }
  31 |   });
  32 | 
  33 |   test('Authenticated user can open application modal', async ({ page }) => {
  34 |     // Mock the backend API calls so frontend works without Vercel CLI
  35 |     await page.route('/api/colleges', async route => {
  36 |       await route.fulfill({ 
  37 |         json: [{
  38 |           id: 'mock_college_1',
  39 |           name: 'Mock Engineering College',
  40 |           city: 'Pune',
  41 |           state: 'Maharashtra',
  42 |           location: 'Pune, Maharashtra',
  43 |           rating: 4.5,
  44 |           established: '2000',
  45 |           totalSeats: 120,
  46 |           type: 'Engineering',
  47 |           fees: { min: 100000, max: 200000 },
  48 |           coursesOffered: ['B.Tech'],
  49 |           image: '/students_campus.png',
  50 |           facilities: ['WiFi']
  51 |         }]
  52 |       });
  53 |     });
  54 | 
  55 |     // Navigate to colleges directory
  56 |     await page.goto('/colleges');
  57 |     
  58 |     // Click on the first college card
> 59 |     await page.click('a[href^="/college/"] >> nth=0');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  60 |     
  61 |     // Ensure we are on the details page
  62 |     await expect(page.locator('button:has-text("Apply Now")')).toBeVisible();
  63 |     
  64 |     // Click Apply Now
  65 |     await page.click('button:has-text("Apply Now")');
  66 |     
  67 |     // Verify the Application Modal opens
  68 |     await expect(page.locator('h3:has-text("Application Form")')).toBeVisible();
  69 |     
  70 |     // Fill out phone number
  71 |     await page.fill('input[name="phone"]', '+919876543210');
  72 |     
  73 |     // Submit
  74 |     await page.click('button:has-text("Submit Application")');
  75 |     
  76 |     // Check for success screen
  77 |     await expect(page.locator('h3:has-text("Application Submitted!")')).toBeVisible();
  78 |   });
  79 | });
  80 | 
```