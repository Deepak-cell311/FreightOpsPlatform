# FreightOps Driver Mobile App - FlutterFlow Implementation Guide

## 1. PROJECT SETUP

### FlutterFlow Project Configuration
```
Project Name: FreightOps Driver
Package Name: com.freightops.driver
App Icon: Blue truck icon with "FO" logo
Primary Color: #3B82F6 (Blue)
Secondary Color: #10B981 (Green)
Font: Inter
Platform: iOS & Android
```

### Backend Integration
```
Base URL: https://your-freightops-domain.replit.app
Authentication: Session-based with cookies
Content-Type: application/json
```

## 2. AUTHENTICATION SYSTEM

### Login Screen
**API Endpoint:** `POST /api/driver/login`
```json
Request Body:
{
  "email": "driver@company.com",
  "password": "driver_password",
  "deviceId": "unique_device_identifier",
  "rememberMe": true
}

Response:
{
  "success": true,
  "driver": {
    "id": "driver_database_id",
    "firstName": "Driver_FirstName_From_DB",
    "lastName": "Driver_LastName_From_DB", 
    "email": "driver_email_from_database",
    "companyId": "company_database_id",
    "companyName": "Company_Name_From_Database",
    "role": "driver",
    "licenseNumber": "CDL_Number_From_Database",
    "phone": "Driver_Phone_From_Database",
    "status": "Driver_Status_From_Database"
  },
  "company": {
    "id": "company_database_id",
    "name": "Company_Name_From_Database", 
    "dotNumber": "DOT_Number_From_Database",
    "mcNumber": "MC_Number_From_Database"
  },
  "authToken": "session_token_from_authentication"
}
```

**FlutterFlow Implementation:**
- Create Custom Action: `authenticateDriver`
- Store user data in App State
- Navigate to Dashboard on success
- Handle error messages for invalid credentials

### Session Management
**API Endpoint:** `GET /api/auth/user`
- Check authentication status on app launch
- Redirect to login if session expired
- Auto-login if valid session exists

## 3. MAIN DASHBOARD

### Driver Status Widget
**API Endpoint:** `GET /api/drivers/{driverId}`
```json
Response:
{
  "id": "driver_id_from_database",
  "firstName": "driver_firstName_from_database",
  "lastName": "driver_lastName_from_database",
  "status": "driver_status_from_database", // available, assigned, in_transit, off_duty
  "currentLocation": {
    "latitude": "driver_current_latitude_from_gps",
    "longitude": "driver_current_longitude_from_gps"
  },
  "hoursWorked": "calculated_from_hos_logs",
  "hoursRemaining": "calculated_from_hos_regulations",
  "nextMandatoryBreak": "calculated_break_time_based_on_hos"
}
```

**FlutterFlow Components:**
- Container with driver photo and name
- Status badge (color-coded)
- Toggle button for duty status
- Hours of service progress bar

### Current Load Display
**API Endpoint:** `GET /api/driver/loads/current?driverId={driver_id}`
```json
Response: // Database loads assigned to driver
[
  {
    "id": "load_id_from_database",
    "loadNumber": "load_number_from_database",
    "status": "load_status_from_database", // assigned, in_transit, at_pickup, loaded, at_delivery, delivered
    "pickupCity": "pickup_city_from_database",
    "pickupState": "pickup_state_from_database",
    "deliveryCity": "delivery_city_from_database", 
    "deliveryState": "delivery_state_from_database",
    "scheduledPickup": "scheduled_pickup_from_database",
    "scheduledDelivery": "scheduled_delivery_from_database",
    "miles": "miles_from_database",
    "pay": "driver_pay_from_database",
    "commodity": "commodity_from_database",
    "weight": "weight_from_database",
    "stops": [
      {
        "id": "stop_id_from_database",
        "stopNumber": "stop_number_from_database",
        "stopType": "stop_type_from_database",
        "companyName": "company_name_from_database",
        "address": "address_from_database",
        "city": "city_from_database",
        "state": "state_from_database",
        "zipCode": "zip_code_from_database",
        "scheduledArrival": "scheduled_arrival_from_database",
        "latitude": "latitude_from_database",
        "longitude": "longitude_from_database",
        "isCompleted": "completion_status_from_database",
        "geofenceRadius": "geofence_radius_from_settings"
      }
    ]
  }
]
```

## 4. LOAD MANAGEMENT

### Load Details Screen
**Components Required:**
- Load summary card
- Stop-by-stop timeline
- Documents checklist
- Status update buttons
- Navigation integration

### Status Updates
**API Endpoint:** `PUT /api/loads/{loadId}/status`
```json
Request Body:
{
  "status": "at_pickup",
  "location": {
    "latitude": 41.8781,
    "longitude": -87.6298
  },
  "timestamp": "2024-01-15T08:30:00Z",
  "notes": "Arrived at pickup location"
}
```

**Status Flow:**
1. assigned → in_transit
2. in_transit → at_pickup
3. at_pickup → loaded
4. loaded → at_delivery
5. at_delivery → delivered

### Document Management
**API Endpoint:** `GET /api/loads/{loadId}/documents`
```json
Response:
[
  {
    "id": 1,
    "documentType": "bill_of_lading",
    "fileName": "BOL_LN-2024-001.pdf",
    "isRequired": true,
    "isSubmitted": false,
    "uploadUrl": "/api/documents/upload"
  },
  {
    "id": 2,
    "documentType": "delivery_receipt",
    "fileName": "delivery_receipt.jpg",
    "isRequired": true,
    "isSubmitted": false
  }
]
```

**Upload Documents:**
**API Endpoint:** `POST /api/documents/upload`
- Use FlutterFlow's file picker
- Upload to backend with multipart/form-data
- Update document status automatically

## 5. GPS TRACKING & NAVIGATION

### Real-time Location Updates
**API Endpoint:** `POST /api/driver/location`
```json
Request Body:
{
  "driverId": 123,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "speed": 65,
  "heading": 180,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**FlutterFlow Implementation:**
- Enable location permissions
- Create periodic action (every 30 seconds while driving)
- Use Custom Action to send location data
- Only track when driver is on duty

### Geofencing
**API Endpoint:** `GET /api/driver/geofence-events`
```json
Response:
[
  {
    "id": 1,
    "stopId": 1,
    "eventType": "entered", // entered, exited
    "timestamp": "2024-01-15T08:25:00Z",
    "automaticStatusUpdate": true
  }
]
```

**Implementation:**
- Monitor distance to stop locations
- Trigger automatic status updates
- Show arrival notifications

## 6. COMMUNICATION

### Messages from Dispatch
**API Endpoint:** `GET /api/driver/notifications`
```json
Response:
[
  {
    "id": 1,
    "type": "message",
    "title": "Load Update",
    "message": "Pickup time changed to 10:00 AM",
    "priority": "high", // low, medium, high, urgent
    "timestamp": "2024-01-15T07:30:00Z",
    "isRead": false,
    "loadId": 789
  }
]
```

### Send Messages to Dispatch
**API Endpoint:** `POST /api/driver/messages`
```json
Request Body:
{
  "driverId": 123,
  "message": "Running 30 minutes late due to traffic",
  "loadId": 789,
  "messageType": "delay_notification"
}
```

## 7. HOURS OF SERVICE (HOS)

### Current HOS Status
**API Endpoint:** `GET /api/drivers/{driverId}/hos`
```json
Response:
{
  "currentStatus": "driving",
  "hoursWorked": 8.5,
  "hoursRemaining": 2.5,
  "nextMandatoryBreak": "2024-01-15T16:00:00Z",
  "weeklyHours": 45.5,
  "weeklyLimit": 70,
  "violations": [],
  "drivingWindow": {
    "start": "2024-01-15T06:00:00Z",
    "end": "2024-01-15T20:00:00Z"
  }
}
```

### HOS Log Updates
**API Endpoint:** `POST /api/drivers/{driverId}/hos/update`
```json
Request Body:
{
  "status": "off_duty", // on_duty, driving, sleeper_berth, off_duty
  "timestamp": "2024-01-15T18:00:00Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Truck Stop Rd, City, ST"
  }
}
```

## 8. PAY & EARNINGS

### Current Period Earnings
**API Endpoint:** `GET /api/driver/pay/current?driverId={driver_id}`
```json
Response: // Pay calculations from database
{
  "currentPeriodEarnings": "calculated_total_from_completed_loads",
  "completedLoads": "completed_load_count_from_database",
  "totalMiles": "sum_of_miles_from_load_records",
  "averagePayPerMile": "calculated_pay_per_mile_from_data",
  "bonuses": "bonus_amounts_from_load_records",
  "payPeriodStart": "pay_period_start_from_payroll_settings",
  "payPeriodEnd": "pay_period_end_from_payroll_settings",
  "nextPayDate": "next_pay_date_from_payroll_schedule"
}
```

### Load History by Week
**API Endpoint:** `GET /api/driver/loads/history?weeks=4`
```json
Response:
{
  "weeklyHistory": [
    {
      "weekNumber": "calculated_week_number",
      "weekStartDate": "calculated_week_start_date",
      "weekEndDate": "calculated_week_end_date",
      "weekLabel": "generated_week_label_from_dates",
      "totalLoads": "count_of_loads_completed_in_week",
      "totalMiles": "sum_of_miles_from_week_loads",
      "totalPay": "sum_of_pay_from_week_loads",
      "averagePayPerMile": "calculated_average_from_week_data",
      "onTimeDeliveries": "count_of_on_time_deliveries_from_database",
      "onTimePercentage": "calculated_percentage_from_delivery_data",
      "loads": [
        {
          "id": "load_id_from_database",
          "loadNumber": "load_number_from_database",
          "completedDate": "completion_date_from_database",
          "pickupCity": "pickup_city_from_database",
          "pickupState": "pickup_state_from_database", 
          "deliveryCity": "delivery_city_from_database",
          "deliveryState": "delivery_state_from_database",
          "miles": "miles_from_database",
          "pay": "driver_pay_from_database",
          "commodity": "commodity_from_database",
          "weight": "weight_from_database",
          "deliveredOnTime": "calculated_from_scheduled_vs_actual",
          "customerRating": "rating_from_customer_feedback_system",
          "bonusEarned": "bonus_amount_from_database"
        }
      ]
    }
  ],
  "overallStats": {
    "totalWeeks": "number_of_weeks_requested",
    "grandTotalLoads": "total_loads_across_all_weeks",
    "grandTotalMiles": "total_miles_across_all_weeks",
    "grandTotalPay": "total_pay_across_all_weeks",
    "averageLoadsPerWeek": "calculated_average_loads_per_week",
    "averageMilesPerWeek": "calculated_average_miles_per_week",
    "averagePayPerWeek": "calculated_average_pay_per_week",
    "overallOnTimePercentage": "calculated_overall_on_time_percentage",
    "averageCustomerRating": "calculated_average_rating_from_feedback"
  }
}
```

### Driver Paystubs
**API Endpoint:** `GET /api/driver/paystubs?limit=12`
```json
Response:
{
  "paystubs": [
    {
      "id": "paystub_id_from_payroll_system",
      "payPeriodNumber": "pay_period_number_from_payroll",
      "payPeriodStart": "pay_period_start_from_payroll_schedule",
      "payPeriodEnd": "pay_period_end_from_payroll_schedule",
      "payDate": "pay_date_from_payroll_schedule",
      
      "earnings": {
        "regularPay": "calculated_regular_pay_from_hours_and_rate",
        "overtimePay": "calculated_overtime_pay_from_hours_over_40",
        "bonuses": "total_bonuses_from_load_records",
        "mileageBonus": "calculated_mileage_bonus_from_loads",
        "safetyBonus": "calculated_safety_bonus_from_record",
        "onTimeBonus": "calculated_on_time_bonus_from_deliveries",
        "grossPay": "calculated_total_gross_pay"
      },
      
      "deductions": {
        "federalIncomeTax": "calculated_federal_tax_from_w4_and_tables",
        "stateIncomeTax": "calculated_state_tax_from_w4_and_tables",
        "socialSecurityTax": "calculated_ss_tax_from_gross_pay",
        "medicareTax": "calculated_medicare_tax_from_gross_pay",
        "healthInsurance": "health_insurance_deduction_from_benefits",
        "dentalInsurance": "dental_insurance_deduction_from_benefits",
        "visionInsurance": "vision_insurance_deduction_from_benefits",
        "retirement401k": "401k_contribution_from_employee_elections",
        "lifeInsurance": "life_insurance_premium_from_benefits",
        "totalDeductions": "calculated_total_deductions"
      },
      
      "netPay": "calculated_net_pay_gross_minus_deductions",
      
      "loadDetails": {
        "totalLoads": "count_of_loads_completed_in_period",
        "totalMiles": "sum_of_miles_from_period_loads",
        "averagePayPerMile": "calculated_average_from_period_loads",
        "loads": [
          {
            "loadNumber": "load_number_from_database",
            "completedDate": "completion_date_from_database",
            "miles": "miles_from_database",
            "pay": "driver_pay_from_database",
            "pickupCity": "pickup_city_from_database",
            "deliveryCity": "delivery_city_from_database"
          }
        ]
      },
      
      "yearToDate": {
        "grossPay": "ytd_gross_pay_from_payroll_records",
        "netPay": "ytd_net_pay_from_payroll_records",
        "federalTaxWithheld": "ytd_federal_tax_from_payroll_records",
        "socialSecurityWithheld": "ytd_ss_tax_from_payroll_records",
        "medicareWithheld": "ytd_medicare_tax_from_payroll_records"
      },
      
      "company": {
        "name": "company_name_from_database",
        "address": "company_address_from_database",
        "city": "company_city_from_database",
        "state": "company_state_from_database",
        "zipCode": "company_zip_from_database",
        "ein": "company_ein_from_database",
        "phone": "company_phone_from_database"
      },
      
      "driver": {
        "name": "driver_full_name_from_database",
        "employeeId": "driver_employee_id_from_database",
        "address": "driver_address_from_database",
        "city": "driver_city_from_database",
        "state": "driver_state_from_database",
        "zipCode": "driver_zip_from_database",
        "ssn": "driver_ssn_masked_from_database"
      }
    }
  ],
  "totalPeriods": "total_pay_periods_available",
  "currentPeriod": "current_pay_period_data"
}
```

### Individual Paystub Details
**API Endpoint:** `GET /api/driver/paystubs/{paystubId}`
```json
Response:
{
  "id": "paystub_123_1705276800000",
  "payPeriodStart": "2024-01-08T00:00:00Z",
  "payPeriodEnd": "2024-01-14T23:59:59Z",
  "generatedAt": "2024-01-15T10:00:00Z",
  
  "earnings": {
    "regularPay": 4500.00,
    "bonuses": 450.00,
    "grossPay": 4950.00
  },
  
  "loadDetails": [
    {
      "loadNumber": "LN-2024-001",
      "completedDate": "2024-01-14T18:00:00Z",
      "pickupLocation": "Chicago, IL",
      "deliveryLocation": "Atlanta, GA",
      "miles": 715,
      "rate": 2.10,
      "totalPay": 1500.00,
      "bonusEarned": 150.00,
      "deliveredOnTime": true,
      "customerRating": 5.0
    }
  ],
  
  "hoursWorked": {
    "regularHours": 40,
    "overtimeHours": 5,
    "totalHours": 45
  }
}
```

## 9. VEHICLE INSPECTION

### Pre-Trip Inspection
**API Endpoint:** `POST /api/driver/inspections`
```json
Request Body:
{
  "driverId": 123,
  "vehicleId": 456,
  "inspectionType": "pre_trip",
  "timestamp": "2024-01-15T06:00:00Z",
  "items": [
    {
      "itemName": "tires",
      "status": "pass", // pass, fail, needs_attention
      "notes": "All tires in good condition"
    },
    {
      "itemName": "lights",
      "status": "pass"
    }
  ],
  "overallStatus": "pass",
  "defectsFound": false
}
```

**Inspection Items:**
- Tires and wheels
- Lights and reflectors
- Brakes
- Steering
- Horn
- Windshield and mirrors
- Engine compartment
- Coupling devices (if applicable)

## 10. FLUTTERFLOW SPECIFIC IMPLEMENTATION

### App State Variables
```
- currentUser (JSON)
- currentLoad (JSON)
- driverStatus (String)
- lastKnownLocation (LatLng)
- unreadMessages (List<JSON>)
- isOnDuty (Boolean)
- currentHOS (JSON)
```

### Custom Actions Needed
```dart
// Authentication - connects to real FreightOps database
Future<Map<String, dynamic>> authenticateDriver(String email, String password, String deviceId, bool rememberMe)

// Location Tracking - updates real GPS coordinates in database
Future<void> updateDriverLocation(int driverId, double lat, double lng, double speed, double heading)

// Load Management - updates actual load records in database
Future<void> updateLoadStatus(String loadId, String status, double? lat, double? lng, String? notes)

// Document Upload - stores real documents in FreightOps system
Future<bool> uploadDocument(String loadId, String documentType, FFUploadedFile file)

// HOS Updates - records actual hours of service in compliance system
Future<void> updateHOSStatus(int driverId, String status, double lat, double lng, String address)

// Send Message - sends real messages to dispatch through FreightOps system
Future<void> sendMessageToDispatch(int driverId, String message, String? loadId, String messageType)

// Fetch Data - retrieves actual data from FreightOps database
Future<List<dynamic>> fetchCurrentLoads(int driverId)
Future<Map<String, dynamic>> fetchDriverData(int driverId)
Future<Map<String, dynamic>> fetchHOSData(int driverId)
Future<List<dynamic>> fetchPaystubs(int driverId, int limit)
Future<List<dynamic>> fetchNotifications(int driverId)
```

## 11. DRIVER LOGIN SCREEN

### Login Screen UX Design
**Visual Layout:**
- **Background**: Gradient from deep blue (#1e3a8a) to darker blue (#1e40af) with subtle truck silhouette pattern
- **Logo**: FreightOps logo centered at top, white color, 120px width
- **Container**: Rounded white card (border-radius: 16px) with shadow, centered on screen
- **Padding**: 24px internal padding, 16px margins from screen edges

**Input Field Styling:**
- **Email Field**: 
  - Label: "Email Address" (color: #6b7280, font-size: 14px)
  - Input: White background, gray border (#d1d5db), rounded corners (8px)
  - Icon: Envelope icon inside field (left side, #9ca3af)
  - Height: 48px, full width
- **Password Field**:
  - Label: "Password" (color: #6b7280, font-size: 14px) 
  - Input: Same styling as email with eye icon for visibility toggle
  - Toggle Icon: Eye/eye-slash (right side, #9ca3af)

**Company Dropdown:**
- **Styling**: Same as input fields but with dropdown arrow
- **Placeholder**: "Select Your Company"
- **Options**: Show company logo + name when available

**Interactive Elements:**
- **Remember Me**: Custom checkbox with FreightOps blue (#2563eb) when checked
- **Login Button**: 
  - Background: Linear gradient (#2563eb to #1d4ed8)
  - Text: "Sign In" (white, font-weight: 600, 16px)
  - Height: 52px, full width, rounded corners (8px)
  - Loading State: Spinner animation + "Signing In..." text
- **Forgot Password**: Link style (#2563eb, underlined on press)

**Biometric Section:**
- **Fingerprint Icon**: Circular button (64px) with fingerprint icon
- **Face ID Icon**: Circular button (64px) with face icon  
- **Colors**: Light gray background (#f3f4f6), blue on active (#2563eb)
- **Position**: Centered below login button with "or" divider

**Error States:**
- **Invalid Credentials**: Red border on fields (#dc2626) + error message
- **Network Error**: Toast notification with retry option
- **Loading**: Disable all inputs, show spinner on button

**API Endpoint:** `POST /api/driver/login`
```json
Request Body:
{
  "email": "driver@company.com",
  "password": "driverPassword",
  "deviceId": "unique_device_identifier",
  "rememberMe": true
}

Response (Success):
{
  "success": true,
  "driver": {
    "id": 123,
    "firstName": "John",
    "lastName": "Doe",
    "email": "driver@company.com",
    "companyId": "company_456",
    "companyName": "FreightOps Transportation",
    "role": "driver",
    "profileImage": "https://...",
    "permissions": ["load_management", "hos_logging", "document_upload"]
  },
  "authToken": "jwt_token_here",
  "sessionExpiry": "2024-01-15T23:59:59Z"
}

Response (Error):
{
  "success": false,
  "error": "Invalid credentials",
  "errorCode": "AUTH_FAILED"
}
```

**FlutterFlow Implementation:**
- Create custom action: `authenticateDriver`
- Store auth token and driver data in App State
- Enable biometric authentication using device capabilities
- Handle offline login with cached credentials
- Navigate to Dashboard on successful login

## 12. AI-POWERED HOS LOGBOOK SYSTEM

### HOS Dashboard UX Design
**Main Dashboard Layout:**
- **Header**: Status bar with current duty status (On-Duty, Driving, Sleeper, Off-Duty)
  - Background colors: Green (#16a34a) for compliant, Yellow (#eab308) for warning, Red (#dc2626) for violation
  - Text: Large, bold status text with time remaining
- **Clock Display**: Circular progress indicator showing hours used vs. available
  - Outer ring: 11-hour driving limit (blue #2563eb)
  - Inner ring: 14-hour duty limit (orange #ea580c)
  - Center: Current time (24-hour format, large font)

**AI Recommendations Card:**
- **Card Design**: White background, subtle shadow, rounded corners (12px)
- **AI Icon**: Brain/lightbulb icon in FreightOps blue (#2563eb)
- **Title**: "AI Recommendations" (font-weight: 600, 18px)
- **Recommendations**: 
  - Bullet points with action icons
  - Green checkmarks for good actions
  - Yellow warning triangles for cautions
  - Red alerts for critical items
- **Confidence Score**: Progress bar showing AI confidence (0-100%)

**Violation Alert Design:**
- **Alert Banner**: Red background (#dc2626) with white text
- **Icon**: Warning triangle with exclamation mark
- **Text**: Bold violation type + time remaining
- **Action Button**: "View Options" button (white background, red text)
- **Dismissible**: X button on right side

**Status Change Buttons:**
- **Button Grid**: 2x2 grid layout with equal spacing
- **Button Style**: 
  - Size: 120px x 80px each
  - Rounded corners: 12px
  - Icon + text layout (icon top, text bottom)
- **Colors**:
  - On-Duty: Blue (#2563eb) background
  - Driving: Green (#16a34a) background  
  - Sleeper: Purple (#9333ea) background
  - Off-Duty: Gray (#6b7280) background
- **Active State**: Darker background + white border (2px)

### HOS Compliance Monitoring
**API Endpoint:** `GET /api/driver/hos/compliance-check`
```json
Response:
{
  "currentStatus": "driving",
  "hoursWorked": 9.5,
  "hoursRemaining": 1.5,
  "violations": [
    {
      "id": "violation_001",
      "type": "driving_time_limit",
      "severity": "warning",
      "description": "Approaching 11-hour driving limit",
      "timeRemaining": "1.5 hours",
      "recommendedAction": "Plan for mandatory 10-hour break within 1.5 hours",
      "aiInsight": "Based on your current route, you're 45 minutes from the nearest truck stop with overnight parking."
    }
  ],
  "aiRecommendations": [
    {
      "type": "optimization",
      "title": "Maximize Your Available Hours",
      "description": "Switch to on-duty (not driving) for 30 minutes during loading to preserve driving time",
      "potentialBenefit": "Save 30 minutes of driving time for end of day",
      "confidence": 0.85
    }
  ],
  "nextMandatoryBreak": "2024-01-15T20:00:00Z",
  "weeklyHoursUsed": 45.5,
  "weeklyHoursLimit": 70
}
```

### AI Logbook Assistant
**API Endpoint:** `POST /api/driver/hos/ai-assistant`
```json
Request Body:
{
  "driverId": 123,
  "query": "I need to deliver by 6pm but I'm running low on hours. What should I do?",
  "currentLocation": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "destinationLocation": {
    "latitude": 33.7490,
    "longitude": -84.3880
  },
  "hoursRemaining": 2.5
}

Response:
{
  "aiResponse": "Based on your current location and destination, you have 385 miles remaining with 2.5 hours of drive time. At 65 mph average, you'll need 5.9 hours to complete delivery. Here are your options:\n\n1. **Split Sleeper Option**: Take an 8-hour break now, then drive 2.5 hours to get within 150 miles of destination. Take another 2-hour break to reset your 11-hour clock.\n\n2. **Team Driver**: Contact dispatch to arrange a team driver swap at the truck stop 45 miles ahead.\n\n3. **Delivery Rescheduling**: The delivery window can likely be moved to tomorrow morning, which is safer and compliant.",
  "recommendations": [
    {
      "option": "split_sleeper",
      "description": "Use split sleeper berth provision",
      "steps": [
        "Take 8-hour break at TA Truck Stop (15 miles ahead)",
        "Drive 2.5 hours to Love's Travel Stop near destination", 
        "Take 2-hour break to reset clock",
        "Complete delivery with fresh 11-hour clock"
      ],
      "compliance": "fully_compliant",
      "estimatedArrival": "2024-01-16T08:30:00Z"
    }
  ],
  "complianceRating": "high_risk",
  "suggestedAction": "split_sleeper"
}
```

### HOS Violation Alerts
**Push Notification System:**
```json
{
  "notificationTypes": [
    {
      "type": "driving_time_warning",
      "triggerAt": "30 minutes before limit",
      "title": "Driving Time Alert",
      "message": "You have 30 minutes of driving time remaining. AI suggests taking break at upcoming rest area."
    },
    {
      "type": "duty_time_warning", 
      "triggerAt": "1 hour before 14-hour limit",
      "title": "Duty Time Warning",
      "message": "Your 14-hour duty period ends at 8:00 PM. Plan to be off-duty by then."
    },
    {
      "type": "weekly_hours_warning",
      "triggerAt": "5 hours before 70-hour limit",
      "title": "Weekly Hours Alert", 
      "message": "You're approaching your 70-hour weekly limit. Consider taking a 34-hour restart."
    }
  ]
}
```

## 13. GPS ROUTING WITH FUEL & WEIGHT STATIONS

### GPS Navigation Interface UX Design
**Map Display:**
- **Full Screen Map**: Google Maps or MapBox integration with truck-specific styling
- **Color Scheme**: Dark mode for night driving, light mode for day
- **Route Line**: Thick blue line (#2563eb) for primary route, dashed orange (#ea580c) for alternatives
- **Vehicle Icon**: Custom truck icon showing current position and heading direction
- **Size**: Map takes 70% of screen height, controls take 30%

**Navigation Header:**
- **Background**: Semi-transparent dark overlay (#000000 at 70% opacity)
- **Next Turn Display**: 
  - Large turn arrow icon (left/right/straight)
  - Distance to turn (bold, 24px font)
  - Street name (16px font, white text)
- **ETA Information**:
  - Arrival time (HH:MM format)
  - Distance remaining (miles)
  - Time remaining with traffic delays

**Bottom Control Panel:**
- **Background**: White card with subtle shadow, rounded top corners (16px)
- **Height**: Collapsible between 120px (collapsed) and 300px (expanded)
- **Quick Actions Row**:
  - Fuel button: Gas pump icon + "Fuel Stops"
  - Scale button: Weight scale icon + "Weigh Stations"  
  - Rest button: Bed icon + "Rest Areas"
  - Traffic button: Warning triangle icon + "Traffic"
- **Button Style**: 60px circular buttons, light gray background (#f3f4f6), blue when active

**Fuel Stop Integration:**
- **Map Markers**: Gas pump icons with fuel prices displayed
- **Marker Colors**: 
  - Green (#16a34a): Cheapest fuel
  - Yellow (#eab308): Average pricing
  - Red (#dc2626): Most expensive
- **Info Windows**: 
  - Fuel price per gallon
  - Brand name (Pilot, TA, etc.)
  - Amenities icons (shower, food, parking)
  - Distance from route

**Weight Station Alerts:**
- **Alert Banner**: Yellow background (#fef3c7) with dark text
- **Icon**: Scale icon with status indicator
- **Text**: "Weigh Station Ahead - 2.5 miles" 
- **Status Colors**:
  - Green: Open, no wait
  - Yellow: Open, 5-10 min wait
  - Red: Closed or long wait
- **Action Buttons**: "Skip" or "Details"

**Traffic Rerouting UI:**
- **Traffic Alert**: Red banner with incident details
- **Reroute Options**: Card showing 2-3 alternative routes
- **Route Comparison**:
  - Time difference (+15 min, -5 min)
  - Distance difference (+2.5 mi, -1.2 mi)
  - Toll cost differences
- **Selection**: Tap to select new route, auto-applies in 10 seconds

### Truck-Specific Route Planning with Live Traffic
**API Endpoint:** `POST /api/driver/route/optimize`
```json
Request Body:
{
  "driverId": 123,
  "origin": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, NY"
  },
  "destination": {
    "latitude": 33.7490,
    "longitude": -84.3880,
    "address": "Atlanta, GA"
  },
  "truckSpecs": {
    "length": 75,
    "width": 8.5,
    "height": 13.6,
    "weight": 80000,
    "axles": 5
  },
  "cargoType": "hazmat", // Options: hazmat, oversized, refrigerated, containers, livestock, general
  "fuelTankCapacity": 300,
  "currentFuelLevel": 180,
  "mpg": 6.8,
  "preferences": {
    "avoidTolls": false,
    "preferTruckStops": true,
    "fuelBrand": "pilot_flying_j"
  }
}

Response:
{
  "route": {
    "totalDistance": 872.5,
    "estimatedDuration": "13h 45m",
    "fuelNeeded": 128.3,
    "estimatedFuelCost": 385.12,
    "tollCosts": 67.25,
    "cargoRestrictions": {
      "hazmatRestricted": true,
      "avoidTunnels": true,
      "avoidDenseCities": true,
      "requiredPermits": ["hazmat"],
      "truckRoutesOnly": true
    },
    "trafficImpact": {
      "currentDelay": "50 minutes",
      "alternativeRoutesAvailable": 2,
      "bestAlternative": "I-295 Bypass Route saves 20 minutes"
    },
    "waypoints": [
      {
        "latitude": 40.2732,
        "longitude": -76.8867,
        "type": "fuel_stop",
        "name": "Pilot Travel Center - Harrisburg",
        "address": "4125 N 6th St, Harrisburg, PA 17110",
        "fuelPrice": 3.89,
        "amenities": ["shower", "restaurant", "truck_wash", "scales"],
        "hazmatFueling": false,
        "mandatory": true,
        "reason": "Fuel capacity requirement"
      }
    ]
  },
  "fuelStops": [
    {
      "id": "fuel_truck_001",
      "name": "TA Travel Center",
      "brand": "travel_centers_america",
      "latitude": 37.2431,
      "longitude": -79.8658,
      "fuelPrice": 3.89,
      "dieselAvailable": true,
      "defAvailable": true,
      "truckParking": 150,
      "amenities": ["shower", "restaurant", "laundry", "truck_wash", "scales"],
      "truckFriendly": true,
      "maxVehicleLength": 75,
      "hazmatFueling": false,
      "hours": "24/7"
    },
    {
      "id": "fuel_truck_002",
      "name": "Pilot Flying J",
      "brand": "pilot_flying_j",
      "latitude": 35.1234,
      "longitude": -82.4567,
      "fuelPrice": 3.85,
      "dieselAvailable": true,
      "defAvailable": true,
      "truckParking": 200,
      "amenities": ["shower", "restaurant", "laundry", "truck_wash", "scales", "maintenance"],
      "truckFriendly": true,
      "maxVehicleLength": 80,
      "hazmatFueling": true,
      "hours": "24/7"
    }
  ],
  "weightStations": [
    {
      "id": "weigh_truck_001",
      "name": "DOT Weigh Station - Northbound",
      "latitude": 38.5234,
      "longitude": -79.1234,
      "status": "open",
      "hours": "24/7",
      "bypassAllowed": false,
      "prepassAccepted": true,
      "weighInMotion": true,
      "currentWaitTime": "3 minutes",
      "truckServices": ["weight_verification", "inspection", "permit_check"]
    }
  ],
  "truckRestAreas": [
    {
      "id": "rest_truck_001",
      "name": "Interstate Rest Area - Mile 150",
      "latitude": 36.8765,
      "longitude": -80.5432,
      "truckParking": 50,
      "amenities": ["restrooms", "vending", "picnic_area"],
      "hours": "24/7",
      "securityLevel": "high",
      "maxParkingHours": 10
    }
  ],
  "liveTraffic": {
    "incidents": [
      {
        "id": "traffic_001",
        "type": "accident",
        "location": "I-95 Mile 145",
        "severity": "major",
        "delayMinutes": 35,
        "description": "Multi-vehicle accident blocking 2 lanes",
        "alternativeRoute": "Use I-295 bypass"
      }
    ],
    "trafficLevel": "heavy",
    "lastUpdated": "2024-01-15T14:00:00Z"
  },
  "routingRestrictions": {
    "hazmatRestricted": true,
    "avoidTunnels": true,
    "requiredPermits": ["hazmat"]
  },
  "hazards": [
    {
      "type": "tunnel_restriction",
      "location": "Baltimore Harbor Tunnel",
      "description": "Hazmat vehicles prohibited",
      "estimatedDelay": "45 minutes via alternate route",
      "alternativeRoute": "Use I-695 Beltway",
      "affectsTrucks": true
    }
  ]
}

### Live Traffic Rerouting
**API Endpoint:** `POST /api/driver/route/reroute`
```json
Request Body:
{
  "currentLocation": {
    "latitude": 39.2904,
    "longitude": -76.6122
  },
  "destination": {
    "latitude": 33.7490,
    "longitude": -84.3880
  },
  "truckSpecs": {
    "length": 75,
    "width": 8.5,
    "height": 13.6,
    "weight": 80000,
    "axles": 5
  },
  "cargoType": "hazmat",
  "avoidIncidents": ["traffic_001", "construction_002"]
}

Response:
{
  "newRoute": {
    "routeId": "alt_primary",
    "description": "Primary Alternative Route",
    "totalDistance": 425.8,
    "duration": 6.2,
    "trafficDelay": 12,
    "avoids": ["traffic_001", "construction_002"],
    "fuelStops": 1,
    "tollCosts": 25.50,
    "truckFriendly": true
  },
  "trafficSavings": "23 minutes saved",
  "alternativeRoutes": [
    {
      "routeId": "alt_secondary",
      "description": "Scenic Route via US Highways",
      "totalDistance": 450.3,
      "duration": 7.1,
      "trafficDelay": 5,
      "tollCosts": 0
    }
  ],
  "reroute_reason": "traffic_congestion",
  "eta_improvement": {
    "timeSaved": "23 minutes",
    "percentImprovement": "38%",
    "newETA": "2024-01-15T22:30:00Z"
  }
}
```

### Real-time Fuel Price Updates
**API Endpoint:** `GET /api/driver/fuel-prices/nearby`
```json
Request Parameters:
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 50,
  "fuelType": "diesel"
}

Response:
{
  "fuelStations": [
    {
      "stationId": "station_001",
      "name": "TA Travel Center",
      "brand": "travel_centers_america",
      "latitude": 40.7500,
      "longitude": -74.1000,
      "dieselPrice": 3.85,
      "defPrice": 2.95,
      "lastUpdated": "2024-01-15T11:30:00Z",
      "distance": 5.2,
      "truckParking": 85,
      "amenities": ["shower", "restaurant", "scales", "truck_wash"],
      "reviews": {
        "rating": 4.2,
        "totalReviews": 156,
        "cleanlinessRating": 4.1,
        "serviceRating": 4.3
      },
      "loyaltyDiscount": 0.10,
      "estimatedSavings": 25.50
    }
  ],
  "averagePrice": 3.92,
  "lowestPrice": 3.79,
  "highestPrice": 4.15,
  "priceTrend": "increasing",
  "predictedPriceChange": "+0.05 in next 3 days"
}
```

### Weight Station Alerts
**API Endpoint:** `GET /api/driver/weight-stations/alerts`
```json
Response:
{
  "upcomingStations": [
    {
      "stationId": "weigh_001",
      "name": "I-95 North Weigh Station",
      "state": "Virginia",
      "latitude": 38.7223,
      "longitude": -77.2234,
      "distanceAhead": 23.5,
      "estimatedArrival": "2024-01-15T16:45:00Z",
      "status": "open",
      "currentWaitTime": "5 minutes",
      "bypassOptions": {
        "prepassEligible": true,
        "ezpassAccepted": false,
        "weighInMotion": true
      },
      "recentAlerts": [
        "Heavy enforcement today - thorough inspections",
        "DEF testing in progress",
        "Scale calibration completed - accurate weights"
      ]
    }
  ],
  "closedStations": [
    {
      "stationId": "weigh_002", 
      "name": "I-81 South Weigh Station",
      "reason": "maintenance",
      "expectedReopen": "2024-01-16T06:00:00Z"
    }
  ]
}
```

## 14. PAY TRACKING & LOAD HISTORY

### Pay Tracking Dashboard UX Design
**Summary Cards Layout:**
- **Current Week Card**: White background, blue accent border (#2563eb)
  - Large dollar amount (font-size: 32px, bold)
  - "Current Week Earnings" subtitle
  - Progress bar showing week completion
- **Monthly Earnings Card**: Light green background (#f0fdf4)
  - Month-to-date total with percentage change
  - Small chart showing daily earnings trend
- **Year-to-Date Card**: Light blue background (#eff6ff)
  - YTD total with tax withholdings
  - "View Tax Documents" link

**Paystub Interface:**
- **Header Section**: Company logo + pay period dates
  - Background: Dark blue gradient (#1e3a8a to #1e40af)
  - White text with professional typography
- **Earnings Section**: Clean table layout
  - Regular Hours: Rate × Hours = Amount
  - Overtime Hours: OT Rate × OT Hours = Amount  
  - Bonuses: Performance/Safety bonuses listed separately
  - Background: Alternating white/light gray rows
- **Deductions Section**: Clear breakdown
  - Federal Tax, State Tax, FICA, Medicare
  - Benefits: Health, 401k contributions
  - Other: Union dues, equipment fees
- **Net Pay**: Large, bold final amount in green box

### Weekly Load History UX Design
**Weekly View Layout:**
- **Week Navigation**: Left/right arrows with week range display
- **Summary Bar**: Total loads, miles, earnings for the week
- **Daily Breakdown**: Expandable cards for each day
  - Day header: Date + day name + daily total
  - Load cards: Collapsed view showing basic info
  - Expand button: "Show 3 loads" with chevron down

**Individual Load Cards:**
- **Load Number**: Large, bold text at top (#1a202c)
- **Customer Info**: 
  - Company name (16px, medium weight)
  - Contact info (14px, gray #6b7280)
- **Route Information**:
  - Pickup: City, State + time
  - Delivery: City, State + time
  - Miles: Total distance with map icon
- **Financial Details**:
  - Base Rate: $X.XX per mile
  - Bonus Pay: Fuel savings, on-time delivery
  - Total Pay: Large green text ($XXX.XX)
- **Performance Metrics**:
  - Customer Rating: Stars + numerical score
  - On-Time: Green checkmark or red X
  - Fuel Efficiency: MPG achieved vs. target

**Load Details Expansion:**
- **Timeline View**: Pickup → Transit → Delivery with status icons
- **Documents**: BOL, delivery receipt, photos
- **Communication**: Message thread with dispatch
- **Expenses**: Fuel receipts, tolls, parking
- **Notes**: Driver notes and special instructions

### Navigation Structure
```
1. Splash Screen → Login/Dashboard
2. Login Screen → Dashboard  
3. Dashboard → Load Details, Messages, Profile, HOS, Navigation
4. Load Details → Navigation, Documents, Status Updates
5. Messages → Message Detail, Send Message
6. Profile → Settings, Pay History, Vehicle Inspection
7. HOS → Logbook, AI Assistant, Compliance Alerts
8. Navigation → Route Planning, Fuel Stops, Weight Stations
9. Pay History → Weekly Loads, Paystubs, Tax Documents
```

### Offline Functionality
- Cache current load data locally
- Store pending status updates for sync when online
- Save location updates for batch upload
- Enable basic app functionality without internet

### Push Notifications
**Implementation:**
- Firebase Cloud Messaging integration
- Handle notification types: new loads, messages, HOS violations
- Deep linking to specific screens based on notification

### Security Requirements
- Secure authentication token storage
- Encrypt sensitive data at rest
- SSL/TLS for all API communications
- Location data privacy compliance

This guide provides the complete technical specification for building the FreightOps Driver app in FlutterFlow, with all necessary API endpoints, data structures, and implementation details.