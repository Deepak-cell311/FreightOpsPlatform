# FreightOps Driver App - FlutterFlow Pages & Components Structure

## PAGES ORGANIZATION

### 1. Authentication Pages
**Page: LoginPage**
- Path: `/login`
- Components Used: LoginForm, CompanySelector, BiometricAuth
- Navigation: → DashboardPage (on success)

**Page: ForgotPasswordPage**
- Path: `/forgot-password`
- Components Used: EmailInput, ResetButton
- Navigation: → LoginPage (after reset sent)

### 2. Main Navigation Pages
**Page: DashboardPage**
- Path: `/dashboard`
- Components Used: DriverStatusCard, CurrentLoadCard, HOSQuickView, AlertsBanner
- Navigation: Bottom navigation root

**Page: LoadsPage**
- Path: `/loads`
- Components Used: LoadsList, LoadCard, LoadFilters
- Navigation: → LoadDetailsPage

**Page: HOSPage**
- Path: `/hos`
- Components Used: HOSClock, StatusButtons, ViolationAlerts, AIRecommendations
- Navigation: Bottom navigation root

**Page: PayPage**
- Path: `/pay`
- Components Used: PaySummaryCard, WeeklyHistory, PaystubsList
- Navigation: → PaystubDetailsPage

**Page: ProfilePage**
- Path: `/profile`
- Components Used: DriverProfile, SettingsMenu, LogoutButton
- Navigation: Bottom navigation root

### 3. Detail Pages
**Page: LoadDetailsPage**
- Path: `/load/{loadId}`
- Components Used: LoadHeader, StopsList, DocumentsChecklist, StatusUpdateButtons
- Navigation: → DocumentUploadPage, → NavigationPage

**Page: PaystubDetailsPage**
- Path: `/paystub/{paystubId}`
- Components Used: PaystubHeader, EarningsBreakdown, DeductionsBreakdown, LoadDetailsList
- Navigation: Back to PayPage

**Page: NavigationPage**
- Path: `/navigation/{loadId}`
- Components Used: TruckMap, NavigationHeader, BottomControls, FuelStopsOverlay
- Navigation: → LoadDetailsPage

**Page: InspectionPage**
- Path: `/inspection`
- Components Used: InspectionForm, InspectionItemsList, PhotoUpload
- Navigation: Back to DashboardPage

**Page: DocumentUploadPage**
- Path: `/document/{loadId}/{docType}`
- Components Used: CameraCapture, DocumentPreview, UploadButton
- Navigation: Back to LoadDetailsPage

**Page: MessagesPage**
- Path: `/messages`
- Components Used: MessagesList, MessageBubble, MessageInput
- Navigation: Back to DashboardPage

## REUSABLE COMPONENTS

### Authentication Components
**Component: LoginForm**
```
Properties:
- emailController (TextEditingController)
- passwordController (TextEditingController)
- isLoading (bool)
- errorMessage (String?)

Actions:
- onLogin(email, password) → Custom Action
- onForgotPassword() → Navigate to ForgotPasswordPage
```

**Component: BiometricAuth**
```
Properties:
- isEnabled (bool)
- biometricType (String) // "fingerprint" or "face"

Actions:
- onBiometricLogin() → Custom Action
```

### Dashboard Components
**Component: DriverStatusCard**
```
Properties:
- driverName (String)
- status (String) // "available", "assigned", "in_transit", "off_duty"
- profileImage (String)
- hoursWorked (double)

Actions:
- onStatusChange(newStatus) → Custom Action
```

**Component: CurrentLoadCard**
```
Properties:
- loadData (JSON)
- showDetails (bool)

Actions:
- onViewDetails() → Navigate to LoadDetailsPage
- onUpdateStatus() → Custom Action
```

**Component: HOSQuickView**
```
Properties:
- hoursWorked (double)
- hoursRemaining (double)
- nextBreak (DateTime)
- violationLevel (String) // "none", "warning", "critical"

Actions:
- onViewFullHOS() → Navigate to HOSPage
```

### Load Management Components
**Component: LoadCard**
```
Properties:
- loadId (String)
- loadNumber (String)
- pickupCity (String)
- deliveryCity (String)
- status (String)
- scheduledPickup (DateTime)
- miles (int)
- pay (double)

Actions:
- onTap() → Navigate to LoadDetailsPage
- onStatusUpdate(status) → Custom Action
```

**Component: StopsList**
```
Properties:
- stops (List<JSON>)
- currentStopIndex (int)

Child Components:
- StopCard (for each stop)

Actions:
- onStopComplete(stopId) → Custom Action
```

**Component: StopCard**
```
Properties:
- stopData (JSON)
- isCompleted (bool)
- isCurrent (bool)

Actions:
- onArrived() → Custom Action
- onComplete() → Custom Action
- onNavigate() → Navigate to NavigationPage
```

**Component: DocumentsChecklist**
```
Properties:
- documents (List<JSON>)
- loadId (String)

Child Components:
- DocumentItem (for each document)

Actions:
- onUploadDocument(docType) → Navigate to DocumentUploadPage
```

### HOS Components
**Component: HOSClock**
```
Properties:
- hoursWorked (double)
- drivingHours (double)
- dutyHours (double)
- hoursRemaining (double)

Custom Widget:
- Circular progress indicators
- Color coding based on compliance
```

**Component: StatusButtons**
```
Properties:
- currentStatus (String)
- availableStatuses (List<String>)

Actions:
- onStatusChange(newStatus) → Custom Action
```

**Component: ViolationAlerts**
```
Properties:
- violations (List<JSON>)
- alertLevel (String)

Actions:
- onDismissAlert(alertId) → Custom Action
- onViewRecommendations() → Show AIRecommendations
```

**Component: AIRecommendations**
```
Properties:
- recommendations (List<JSON>)
- confidence (double)

Actions:
- onAcceptRecommendation(recId) → Custom Action
- onAskAI(question) → Custom Action
```

### Navigation Components
**Component: TruckMap**
```
Properties:
- currentLocation (LatLng)
- destination (LatLng)
- route (List<LatLng>)
- fuelStops (List<JSON>)
- weighStations (List<JSON>)

Map Integration:
- Google Maps widget
- Custom markers
- Route polylines
```

**Component: NavigationHeader**
```
Properties:
- nextTurn (String)
- distanceToTurn (double)
- eta (DateTime)
- distanceRemaining (double)

Layout:
- Turn arrow icon
- Distance and time display
```

**Component: BottomControls**
```
Properties:
- showFuelStops (bool)
- showWeighStations (bool)
- showRestAreas (bool)

Actions:
- onToggleFuel() → Toggle fuel stops overlay
- onToggleWeigh() → Toggle weigh stations
- onToggleRest() → Toggle rest areas
```

### Pay Components
**Component: PaySummaryCard**
```
Properties:
- currentPeriodEarnings (double)
- completedLoads (int)
- totalMiles (int)
- nextPayDate (DateTime)

Actions:
- onViewDetails() → Navigate to detailed breakdown
```

**Component: WeeklyHistory**
```
Properties:
- weeklyData (List<JSON>)
- selectedWeek (int)

Child Components:
- WeekCard (for each week)

Actions:
- onWeekSelect(weekIndex) → Update selected week
```

**Component: PaystubsList**
```
Properties:
- paystubs (List<JSON>)
- limit (int)

Child Components:
- PaystubCard (for each paystub)

Actions:
- onPaystubTap(paystubId) → Navigate to PaystubDetailsPage
```

### Shared UI Components
**Component: CustomButton**
```
Properties:
- text (String)
- buttonType (String) // "primary", "secondary", "danger"
- isLoading (bool)
- isDisabled (bool)

Styling:
- FreightOps brand colors
- Consistent sizing
- Loading spinner integration
```

**Component: StatusBadge**
```
Properties:
- status (String)
- statusType (String) // "load", "driver", "document"

Styling:
- Color-coded backgrounds
- Consistent text styling
```

**Component: AlertBanner**
```
Properties:
- alertType (String) // "info", "warning", "error", "success"
- message (String)
- isDismissible (bool)

Actions:
- onDismiss() → Hide banner
```

**Component: LoadingSpinner**
```
Properties:
- size (String) // "small", "medium", "large"
- color (Color)

Animation:
- FreightOps branded spinner
```

## CUSTOM ACTIONS STRUCTURE

### Authentication Actions
```dart
// authenticateDriver.dart
Future<Map<String, dynamic>> authenticateDriver(
  String email,
  String password,
  String deviceId,
  bool rememberMe
)

// checkAuthStatus.dart
Future<Map<String, dynamic>> checkAuthStatus()

// logout.dart
Future<void> logout()
```

### Location Actions
```dart
// updateLocation.dart
Future<void> updateDriverLocation(
  int driverId,
  double latitude,
  double longitude
)

// startLocationTracking.dart
Future<void> startLocationTracking(int driverId)

// stopLocationTracking.dart
Future<void> stopLocationTracking()
```

### Load Actions
```dart
// updateLoadStatus.dart
Future<void> updateLoadStatus(
  String loadId,
  String status,
  LatLng? location,
  String? notes
)

// fetchCurrentLoads.dart
Future<List<dynamic>> fetchCurrentLoads(int driverId)

// fetchLoadDetails.dart
Future<Map<String, dynamic>> fetchLoadDetails(String loadId)
```

### HOS Actions
```dart
// updateHOSStatus.dart
Future<void> updateHOSStatus(
  int driverId,
  String status,
  LatLng location
)

// fetchHOSData.dart
Future<Map<String, dynamic>> fetchHOSData(int driverId)

// checkHOSCompliance.dart
Future<Map<String, dynamic>> checkHOSCompliance(int driverId)
```

### Document Actions
```dart
// uploadDocument.dart
Future<bool> uploadDocument(
  String loadId,
  String documentType,
  FFUploadedFile file
)

// captureDocument.dart
Future<String> captureDocumentPhoto(String documentType)
```

### Communication Actions
```dart
// sendMessage.dart
Future<void> sendMessageToDispatch(
  int driverId,
  String message,
  String? loadId
)

// fetchNotifications.dart
Future<List<dynamic>> fetchDriverNotifications(int driverId)
```

## APP STATE VARIABLES

### Global State
```
- currentUser (JSON) - Driver information and session data
- currentLoads (List<JSON>) - Active loads assigned to driver
- driverStatus (String) - Current duty status
- lastKnownLocation (LatLng) - GPS coordinates
- isOnDuty (bool) - Duty status flag
- currentHOS (JSON) - Hours of service data
- unreadNotifications (List<JSON>) - Unread messages/alerts
```

### Page-Specific State
```
- selectedLoad (JSON) - Currently viewed load
- navigationActive (bool) - GPS navigation status
- uploadProgress (double) - Document upload progress
- selectedWeek (int) - Pay history week selection
- inspectionData (JSON) - Current inspection form data
```

This structure properly separates FlutterFlow pages from reusable components, making the app easier to build and maintain while following FlutterFlow's best practices.