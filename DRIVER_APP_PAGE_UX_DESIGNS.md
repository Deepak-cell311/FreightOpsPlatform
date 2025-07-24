# FreightOps Driver App - Detailed Page UX Designs

## 1. LOGIN PAGE UX

### Visual Layout
**Screen Dimensions:** Full screen, safe area aware
**Background:** Gradient from #1e3a8a (top) to #1e40af (bottom) with subtle truck silhouette pattern overlay at 10% opacity

**Header Section (Top 30%):**
- FreightOps logo: White, 140px width, centered horizontally
- Tagline: "Professional Driver Portal" (16px, white, opacity 70%)
- Spacing: 32px from safe area top

**Login Form Card (Middle 60%):**
- Container: White rounded rectangle, 16px border radius, 8px shadow
- Margins: 20px left/right, centered vertically
- Internal padding: 32px all sides

**Form Fields:**
1. **Email Input:**
   - Label: "Email Address" (14px, #6b7280, medium weight)
   - Input field: 52px height, white background, #d1d5db border, 8px radius
   - Icon: Mail icon (20px) inside left, #9ca3af color
   - Placeholder: "Enter your email"
   - Validation: Red border (#dc2626) on error

2. **Password Input:**
   - Label: "Password" (14px, #6b7280, medium weight)
   - Input field: Same styling as email
   - Icons: Lock icon (left), Eye/eye-slash icon (right) for visibility toggle
   - Placeholder: "Enter your password"

3. **Remember Me Checkbox:**
   - Custom checkbox: 20px square, #2563eb when checked
   - Label: "Keep me signed in" (14px, #374151)
   - Position: Left aligned, 16px spacing from password field

**Action Buttons:**
1. **Sign In Button:**
   - Size: Full width, 56px height
   - Background: Linear gradient #2563eb to #1d4ed8
   - Text: "Sign In" (16px, white, semi-bold)
   - Border radius: 8px
   - Loading state: Spinner + "Signing In..." text
   - Disabled state: #9ca3af background

2. **Forgot Password Link:**
   - Text: "Forgot Password?" (14px, #2563eb, underlined)
   - Position: Center aligned, 20px below sign in button

**Biometric Section (Bottom 20%):**
- Divider: "or" text with horizontal lines (14px, #9ca3af)
- Biometric buttons: Two circular buttons (64px diameter)
  - Fingerprint button: Fingerprint icon, #f3f4f6 background
  - Face ID button: Face icon, #f3f4f6 background
  - Active state: #2563eb background, white icon
- Position: Horizontally centered, 24px spacing between buttons

**Error States:**
- Network error: Toast notification at top with retry button
- Invalid credentials: Red text below form fields
- Loading: Overlay with spinner and "Authenticating..." text

---

## 2. DASHBOARD PAGE UX

### Screen Layout
**Header (Fixed, 80px height):**
- Background: White with 2px bottom border (#e5e7eb)
- Left: Driver avatar (48px circle) + greeting text
- Center: Current time and date
- Right: Notification bell icon with red badge counter

**Greeting Section:**
- Text: "Good morning, {driver.firstName}" (20px, #111827, bold)
- Subtext: Current date from system clock (14px, #6b7280)

**Status Overview Card (120px height):**
- Background: Gradient based on duty status
  - Available: Green gradient (#16a34a to #15803d)
  - On Duty: Blue gradient (#2563eb to #1d4ed8)
  - Off Duty: Gray gradient (#6b7280 to #4b5563)
- Content: Large status text + hours worked/remaining
- Corner: Status change button (32px, white background)

**Current Load Card (Variable height):**
- Background: White card, 12px radius, subtle shadow
- Header: Load number + status badge
- Route: Pickup city → Delivery city with arrow
- Details: Miles, pay, scheduled times
- Progress bar: Visual representation of load completion
- Action button: "View Details" (full width, blue)

**Quick Actions Grid (4 buttons, 2x2):**
- Button size: Square, 80px x 80px each
- Spacing: 12px between buttons
- Icons: 32px, centered above text
- Buttons:
  1. HOS Clock (clock icon, blue)
  2. Messages (chat icon, green)
  3. Inspection (clipboard icon, orange)
  4. Navigation (map icon, purple)

**Recent Activity Section:**
- Header: "Recent Activity" (18px, #111827, bold)
- List items: Icon + text + timestamp
- Max 5 items, scroll if more
- Items: Load updates, messages, HOS changes

**Bottom Navigation (Fixed, 60px height):**
- 5 tabs: Dashboard, Loads, HOS, Pay, Profile
- Active tab: Blue icon and text (#2563eb)
- Inactive tabs: Gray (#6b7280)

---

## 3. LOADS PAGE UX

### Header Section (100px height)
**Search Bar:**
- Container: White background, 44px height, 22px border radius
- Icon: Search icon (18px) left side, #9ca3af
- Placeholder: "Search loads..."
- Clear button: X icon when text entered

**Filter Chips Row:**
- Horizontal scroll row below search
- Chips: "Active", "Completed", "Available", "Overdue"
- Active chip: Blue background (#2563eb), white text
- Inactive chips: Light gray background (#f3f4f6), dark text

### Load Cards List
**Card Design (Each load):**
- Container: White card, 16px radius, 4px shadow
- Height: 140px, margin 8px horizontal, 12px vertical
- Border left: 4px colored strip based on status
  - Green: Completed
  - Blue: Active/In Transit
  - Orange: Delayed
  - Gray: Available

**Card Content Layout:**
- **Top Row:** Load number (left) + Status badge (right)
- **Route Row:** Pickup city → Delivery city with truck icon
- **Details Row:** Miles, Weight, Pay (3 columns)
- **Time Row:** Pickup time | Delivery time
- **Progress Bar:** Visual completion progress (0-100%)
- **Action Button:** "View Details" or status-specific action

**Load Status Colors:**
- Available: #6b7280 (gray)
- Assigned: #2563eb (blue)
- In Transit: #16a34a (green)
- At Pickup: #eab308 (yellow)
- Loaded: #16a34a (green)
- At Delivery: #ea580c (orange)
- Delivered: #059669 (emerald)
- Delayed: #dc2626 (red)

**Empty State:**
- Icon: Truck with question mark (80px, centered)
- Text: "No loads found"
- Subtext: "Check back later or contact dispatch"

**Pull to Refresh:**
- Loading spinner at top when pulling down
- Animation: FreightOps blue spinner

---

## 4. LOAD DETAILS PAGE UX

### Header (80px height)
- Background: White with shadow
- Left: Back arrow button
- Center: Load number (18px, bold)
- Right: More actions menu (3 dots)

### Load Summary Card (180px height)
**Background:** Gradient based on load status
**Content Layout:**
- **Top:** Route with large arrow (Pickup → Delivery)
- **Middle:** Key metrics in 3 columns
  - Miles: Large number + "mi" label
  - Pay: Dollar amount + "total" label  
  - Weight: Pounds + "lbs" label
- **Bottom:** Scheduled pickup and delivery times

### Status Progress Timeline (120px height)
**Visual Design:**
- Horizontal timeline with 5 connected dots
- Active/completed steps: Blue circles with checkmarks
- Current step: Larger blue circle with pulse animation
- Future steps: Gray empty circles
- Connecting lines: Blue (completed) or gray (pending)

**Steps:**
1. Assigned → 2. En Route → 3. At Pickup → 4. Loaded → 5. Delivered

### Stops List Section
**Section Header:**
- Title: "Stops" (20px, bold)
- Counter: "(2 of 3 completed)" (14px, gray)

**Stop Card Design (Each stop):**
- Container: White card, 12px radius
- Height: 100px, 16px margin vertical
- Left border: 4px colored strip (green=completed, blue=current, gray=pending)

**Stop Card Content:**
- **Header:** Stop number + Type (Pickup/Delivery)
- **Company:** Business name (16px, bold)
- **Address:** Full address (14px, gray)
- **Time:** Scheduled/actual time with status
- **Action Button:** "Arrived", "Complete", or "Navigate"

### Documents Checklist (Variable height)
**Section Header:**
- Title: "Required Documents" (18px, bold)
- Progress: "2 of 4 uploaded" (14px, gray)

**Document Items:**
- **Layout:** Row with icon, name, status, action
- **Icons:** Document type icons (24px)
- **Status Indicators:**
  - Green checkmark: Uploaded
  - Red X: Missing/required
  - Yellow warning: Needs review
- **Action Buttons:** "Upload", "View", "Retake"

**Document Types:**
- Bill of Lading
- Delivery Receipt
- Weight Ticket
- Photos (Pickup/Delivery)

### Action Buttons (Fixed bottom, 80px height)
**Button Layout:** Full width, stacked if multiple
- **Primary Action:** Based on current status
  - "Start Trip", "Arrived at Pickup", "Load Complete", etc.
- **Secondary Actions:** "Call Dispatch", "Navigate"
- **Button Style:** 52px height, blue background, white text

---

## 5. HOS (HOURS OF SERVICE) PAGE UX

### Status Header (120px height)
**Background:** Color-coded based on compliance
- Green: Compliant and safe
- Yellow: Warning/approaching limits  
- Red: Violation or critical

**Content:**
- **Large Status Text:** "ON DUTY - DRIVING" (24px, white, bold)
- **Time Remaining:** "2h 15m remaining" (18px, white)
- **Duty End Time:** "Must be off-duty by 8:00 PM" (14px, white, 80% opacity)

### HOS Clock Display (200px height)
**Visual Design:**
- **Outer Ring:** 14-hour duty limit (orange #ea580c)
- **Inner Ring:** 11-hour driving limit (blue #2563eb)
- **Center Circle:** Current time (48px) + date (16px)
- **Progress Indicators:** Filled portions show hours used
- **Numbers:** Hour markers around the outside

**Clock Legend:**
- Orange: Duty hours (14h limit)
- Blue: Driving hours (11h limit)
- Gray: Available hours
- Red: Violation time

### AI Recommendations Card (Variable height)
**Card Header:**
- Icon: Brain/AI icon (24px, blue)
- Title: "AI Recommendations" (18px, bold)
- Confidence: Progress bar (0-100%)

**Recommendation Items:**
- **Icon:** Action type (lightbulb, warning, checkmark)
- **Title:** Brief recommendation (16px, bold)
- **Description:** Detailed explanation (14px, gray)
- **Benefit:** "Save 30 minutes" (14px, green)
- **Action Button:** "Apply" or "Learn More"

### Status Change Buttons (2x2 grid, 160px height)
**Button Design:**
- Size: Square, 72px x 72px each
- Border radius: 12px
- Icon: 32px centered above text
- Text: 12px below icon
- Active state: Darker background + white border

**Buttons:**
1. **ON DUTY** (Blue #2563eb)
2. **DRIVING** (Green #16a34a)  
3. **SLEEPER** (Purple #9333ea)
4. **OFF DUTY** (Gray #6b7280)

### Violation Alerts (If applicable)
**Alert Banner Design:**
- Background: Red #dc2626
- Icon: Warning triangle (24px, white)
- Text: Violation description (16px, white, bold)
- Action: "View Options" button (white background, red text)
- Dismiss: X button (top right)

### Weekly Hours Progress (80px height)
**Progress Bar:**
- Background: Light gray
- Fill: Blue gradient
- Text overlay: "45 of 70 hours used this week"
- Remaining: "25 hours remaining"

### Recent HOS Log (Variable height)
**Section Header:** "Recent Activity" (18px, bold)
**Log Entries:** Time + Status change + Duration
- Example: "2:30 PM - Switched to Driving (45 minutes)"
- Icons: Status type icons
- Timeline: Vertical line connecting entries

---

## 6. PAY PAGE UX

### Current Period Card (140px height)
**Background:** Blue gradient (#2563eb to #1d4ed8)
**Content (White text):**
- **Header:** "Current Pay Period" (16px)
- **Date Range:** "Jan 8 - Jan 14, 2024" (14px, 80% opacity)
- **Large Earnings:** "$4,500.00" (32px, bold)
- **Subtext:** "12 loads completed" (14px, 80% opacity)
- **Progress Bar:** Week progress (white, 20% opacity background)

### Quick Stats Grid (3 columns, 100px height)
**Stat Cards (Each):**
- Background: White card, 8px radius
- **Number:** Large colored number (24px)
- **Label:** Small gray text below (12px)

**Stats:**
1. **Total Miles:** "8,600 mi" (Blue)
2. **Avg Pay/Mile:** "$2.09" (Green)
3. **On-Time %:** "96%" (Orange)

### Weekly History Section
**Section Header:**
- Title: "Weekly Breakdown" (20px, bold)
- Filter dropdown: "Last 4 weeks" (14px, gray)

**Week Cards (Each week):**
- Container: White card, 12px radius, 120px height
- **Header:** Week date range + total pay
- **Stats Row:** Loads, Miles, On-time percentage
- **Expansion:** Tap to show individual loads
- **Chart:** Small bar chart showing daily earnings

### Paystubs Section
**Section Header:**
- Title: "Pay Statements" (20px, bold)
- Filter: "Last 12 periods" dropdown

**Paystub List Items:**
- **Layout:** Row with date, period, amount, status
- **Date:** Pay period end date (16px, bold)
- **Amount:** Net pay amount (16px, green)
- **Status:** "Paid", "Processing", "Pending"
- **Action:** Arrow indicating tap to view details

### Load Details Expansion (When week expanded)
**Individual Load Cards:**
- **Compact Design:** 60px height
- **Content:** Load number, route, miles, pay
- **Status:** Delivered date and customer rating
- **Bonus:** Any bonus amounts in green

---

## 7. NAVIGATION PAGE UX

### Map Display (70% of screen)
**Map Configuration:**
- **Type:** Satellite/hybrid view for better road visibility
- **Style:** Dark mode for night driving, light for day
- **Zoom:** Auto-adjust based on route distance
- **Rotation:** Follow vehicle heading direction

**Map Elements:**
- **Vehicle Icon:** Custom blue truck icon showing direction
- **Route Line:** Thick blue line (#2563eb) for main route
- **Alternative Routes:** Dashed orange lines (#ea580c)
- **Traffic:** Color-coded road segments (green/yellow/red)

### Navigation Header (Overlay, 100px height)
**Background:** Semi-transparent black (#000000 at 80% opacity)
**Content Layout:**
- **Turn Arrow:** Large directional arrow (48px, white)
- **Distance to Turn:** "In 0.5 miles" (20px, white, bold)
- **Street Name:** "Turn right on I-75 South" (16px, white)
- **ETA Display:** "Arrive 2:30 PM" (14px, white, 80% opacity)

### Bottom Control Panel (30% of screen, collapsible)
**Panel States:**
- **Collapsed:** 100px height showing essential controls
- **Expanded:** 250px height showing all options
- **Background:** White with rounded top corners (20px)

**Collapsed State Controls:**
- **Route Info:** Distance remaining + time remaining
- **Quick Actions:** 4 circular buttons (48px each)
  - End Navigation (red)
  - Fuel Stops (blue)
  - Rest Areas (green)  
  - Report Issue (orange)

**Expanded State (Additional controls):**
- **Route Options:** Alternative routes with time/distance differences
- **Stops Along Route:** 
  - Fuel stations with prices
  - Weigh stations with status
  - Rest areas with amenities
  - Truck stops with services

### Fuel Stops Overlay (When activated)
**Map Markers:**
- **Icon:** Gas pump with price label
- **Colors:** Green (cheap), Yellow (average), Red (expensive)
- **Info Window:** Brand, price, amenities, distance from route

**Bottom Sheet:**
- **List View:** Fuel stops sorted by price or distance
- **Details:** Each listing shows full amenities
- **Actions:** "Navigate Here", "Call Station"

### Traffic Incident Alerts
**Alert Banner (Top of screen):**
- **Background:** Red (#dc2626) for accidents, Orange (#ea580c) for delays
- **Icon:** Warning triangle or construction cone
- **Text:** "Accident ahead - 15 min delay"
- **Actions:** "Reroute" or "Continue"

**Reroute Options Modal:**
- **Background:** White modal with 3 route options
- **Comparison:** Time difference, distance difference, toll costs
- **Selection:** Tap route or auto-apply in 10 seconds
- **Preview:** Show new route on map

### Voice Navigation Controls
**Microphone Button:** Floating action button (56px)
- **Position:** Bottom right, above control panel
- **States:** Listening (blue pulse), Speaking (green), Inactive (gray)
- **Voice Commands:** "Navigate to fuel stop", "What's my ETA?", "Report traffic"

---

## 8. PROFILE PAGE UX

### Header Section (180px height)
**Background:** Blue gradient (#2563eb to #1d4ed8)
**Profile Card (Centered):**
- **Avatar:** 80px circle with driver photo
- **Name:** Driver full name (24px, white, bold)
- **Employee ID:** "Employee #12345" (14px, white, 80% opacity)
- **Status Badge:** "Active Driver" (12px, green background)

### Account Information Section
**Section Header:** "Account Information" (18px, bold)
**Info Cards:**
- **Company:** FreightOps Transportation (with logo)
- **CDL Number:** CDL-123456789
- **License Expiry:** Date with days remaining
- **Phone Number:** With edit button
- **Email:** With edit button

### Settings Menu
**Section Header:** "Settings" (18px, bold)
**Menu Items (Each 60px height):**
- **Icon:** 24px relevant icon (left)
- **Title:** Setting name (16px)
- **Subtitle:** Current value or description (14px, gray)
- **Action:** Arrow or toggle switch (right)

**Settings List:**
1. **Notifications** → Push notification preferences
2. **Location Services** → GPS tracking settings
3. **Biometric Login** → Fingerprint/Face ID toggle
4. **Language** → English (US) selected
5. **Units** → Miles/Kilometers preference
6. **Dark Mode** → Toggle switch
7. **Data Usage** → Wi-Fi only options
8. **Privacy** → Data sharing preferences

### Quick Actions Section
**Action Buttons (2 columns):**
- **Support:** "Contact Support" (Blue button)
- **Emergency:** "Emergency Contact" (Red button)
- **Documents:** "View Documents" (Gray button)
- **Training:** "Safety Training" (Green button)

### App Information
**Section Header:** "App Information" (18px, bold)
**Info Items:**
- **Version:** App version number
- **Last Updated:** Date of last app update
- **Terms of Service:** Link to legal documents
- **Privacy Policy:** Link to privacy information

### Logout Section (Bottom)
**Logout Button:**
- **Style:** Full width, 52px height
- **Color:** Red background (#dc2626)
- **Text:** "Sign Out" (16px, white, bold)
- **Confirmation:** "Are you sure?" modal before logout

---

## 9. DOCUMENT UPLOAD PAGE UX

### Header (80px height)
- **Background:** White with shadow
- **Left:** Back arrow button
- **Center:** Document type name (18px, bold)
- **Right:** Help/info button

### Document Type Card (120px height)
**Background:** Light blue (#f0f9ff)
**Content:**
- **Icon:** Large document type icon (48px)
- **Title:** "Bill of Lading" (20px, bold)
- **Description:** "Required for load completion" (14px, gray)
- **Status:** Required/Optional badge

### Camera Capture Section (400px height)
**Camera Preview:**
- **Full width camera viewfinder**
- **Overlay:** Document outline guide (dashed rectangle)
- **Grid lines:** Rule of thirds for alignment
- **Flash toggle:** Top right corner
- **Front/back camera switch:** Top left corner

**Capture Controls (Bottom overlay):**
- **Gallery button:** Access photo library (left)
- **Capture button:** Large white circle (center)
- **Flash toggle:** Lightning bolt icon (right)

### Photo Review Section (After capture)
**Image Preview:**
- **Full screen image display**
- **Zoom:** Pinch to zoom capability
- **Crop:** Corner handles for cropping
- **Rotate:** Rotation button if needed

**Action Buttons:**
- **Retake:** "Retake Photo" (Gray button)
- **Enhance:** "Enhance Quality" (Blue button)
- **Upload:** "Upload Document" (Green button)

### Upload Progress
**Progress Indicator:**
- **Progress bar:** 0-100% with blue fill
- **Status text:** "Uploading..." (16px)
- **File size:** "2.3 MB" (14px, gray)
- **Cancel option:** X button to cancel upload

### Success State
**Confirmation Screen:**
- **Icon:** Large green checkmark (80px)
- **Title:** "Document Uploaded Successfully" (20px, bold)
- **Details:** Upload timestamp and file size
- **Actions:** "Upload Another" or "Done"

### Error States
**Upload Failed:**
- **Icon:** Red X or warning triangle
- **Message:** "Upload failed - check connection"
- **Actions:** "Retry" and "Try Again Later"

**Poor Quality Warning:**
- **Icon:** Yellow warning triangle
- **Message:** "Image quality may be too low"
- **Actions:** "Upload Anyway" or "Retake Photo"

---

## 10. PAYSTUB DETAILS PAGE UX

### Header (80px height)
- **Background:** White with shadow
- **Left:** Back arrow to Pay page
- **Center:** "Pay Statement" (18px, bold)
- **Right:** Download/share button

### Pay Period Header (100px height)
**Background:** Light gray (#f9fafb)
**Content:**
- **Period:** "Pay Period: Jan 8 - Jan 14, 2024" (16px, bold)
- **Pay Date:** "Paid: January 17, 2024" (14px, gray)
- **Net Pay:** Large dollar amount (28px, green, bold)

### Earnings Section
**Section Header:** "Earnings" (18px, bold)
**Earnings Breakdown:**
- **Regular Pay:** Amount + hours worked
- **Overtime Pay:** Amount + overtime hours
- **Bonuses:** Itemized bonus amounts
  - Mileage Bonus: $270.00
  - Safety Bonus: $135.00
  - On-Time Bonus: $45.00
- **Gross Pay:** Total before deductions (bold)

### Deductions Section  
**Section Header:** "Deductions" (18px, bold)
**Deduction Categories:**
- **Taxes:**
  - Federal Income Tax
  - State Income Tax
  - Social Security Tax
  - Medicare Tax
- **Benefits:**
  - Health Insurance
  - Dental Insurance
  - Vision Insurance
  - Life Insurance
  - 401(k) Contribution
- **Total Deductions:** Sum of all deductions (bold)

### Load Details Section
**Section Header:** "Loads Completed This Period" (18px, bold)
**Load Summary Stats:**
- **Total Loads:** Number completed
- **Total Miles:** Miles driven
- **Average Pay/Mile:** Calculated rate

**Individual Load Cards:**
- **Layout:** Compact 80px height cards
- **Content:** Load number, route, completion date
- **Details:** Miles, pay amount, any bonuses
- **Rating:** Customer rating if available

### Year-to-Date Section
**Section Header:** "Year-to-Date Summary" (18px, bold)
**YTD Totals:**
- **Gross Pay:** Total earned this year
- **Net Pay:** Total received after deductions
- **Taxes Withheld:** Total tax deductions
- **Benefits Paid:** Total benefit costs

### Company Information Footer
**Company Details:**
- **Name:** FreightOps Transportation
- **Address:** Complete company address
- **Tax ID:** Employer identification number
- **Contact:** Company phone number

### Export Options
**Action Buttons (Bottom):**
- **Email Paystub:** Send PDF via email
- **Download PDF:** Save to device
- **Print:** If printer available

This comprehensive UX design covers all the essential driver app pages with specific measurements, colors, layouts, and interactive elements needed for FlutterFlow implementation.