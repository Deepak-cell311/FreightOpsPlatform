# FreightOps Pro Driver Mobile App - Complete Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [UX Design Specifications](#ux-design-specifications)
3. [Technical Architecture](#technical-architecture)
4. [Component Library](#component-library)
5. [Page Implementations](#page-implementations)
6. [State Management](#state-management)
7. [Backend Integration](#backend-integration)
8. [Advanced Features](#advanced-features)
9. [Security & Compliance](#security--compliance)
10. [Testing & Deployment](#testing--deployment)

## Project Overview

The FreightOps Pro Driver Mobile App is a Flutter-based mobile application designed specifically for truck drivers to manage their daily operations, hours of service, load tracking, and communication with dispatch. The app follows modern mobile UX patterns with a focus on safety, compliance, and ease of use while driving.

## UX Design Specifications

### Core UX Principles
- **Safety First**: Large touch targets (minimum 48dp), voice commands, minimal driver distraction
- **Compliance Focus**: Automatic DOT/FMCSA compliance tracking and alerts
- **Offline Capability**: Core functions work without internet connectivity
- **Real-time Sync**: Seamless data synchronization when connected
- **Professional UI**: Clean, modern interface matching the web platform
- **Accessibility**: Full screen reader support, high contrast mode, large text options
- **One-Handed Operation**: Critical functions accessible with thumb navigation
- **Glove-Friendly**: Interface works with work gloves and cold weather conditions

### Visual Design System

#### Color Palette
```dart
class DriverAppColors {
  // Primary Colors
  static const Color primary = Color(0xFF2563EB);           // FreightOps Blue
  static const Color primaryLight = Color(0xFF3B82F6);      // Light Blue
  static const Color primaryDark = Color(0xFF1D4ED8);       // Dark Blue
  
  // Status Colors
  static const Color success = Color(0xFF10B981);           // Green - Available, completed
  static const Color warning = Color(0xFFF59E0B);           // Orange - Attention needed
  static const Color error = Color(0xFFEF4444);             // Red - Violations, critical
  static const Color info = Color(0xFF3B82F6);              // Blue - Information
  
  // Background Colors
  static const Color background = Color(0xFFF8FAFC);        // Light gray background
  static const Color surface = Color(0xFFFFFFFF);           // White cards/surfaces
  static const Color surfaceVariant = Color(0xFFF1F5F9);    // Light variant
  
  // Text Colors
  static const Color textPrimary = Color(0xFF1F2937);       // Dark gray
  static const Color textSecondary = Color(0xFF6B7280);     // Medium gray
  static const Color textTertiary = Color(0xFF9CA3AF);      // Light gray
  static const Color textOnPrimary = Color(0xFFFFFFFF);     // White on primary
  
  // Border Colors
  static const Color border = Color(0xFFD1D5DB);            // Light border
  static const Color borderFocus = Color(0xFF2563EB);       // Focused border
  static const Color borderError = Color(0xFFEF4444);       // Error border
}
```

#### Typography Scale
```dart
class DriverAppTextStyles {
  static const TextStyle h1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    height: 1.2,
  );
  
  static const TextStyle h2 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    height: 1.2,
  );
  
  static const TextStyle h3 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    height: 1.3,
  );
  
  static const TextStyle h4 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.3,
  );
  
  static const TextStyle bodyLarge = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.normal,
    height: 1.4,
  );
  
  static const TextStyle bodyMedium = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    height: 1.4,
  );
  
  static const TextStyle bodySmall = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    height: 1.4,
  );
  
  static const TextStyle labelLarge = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    height: 1.2,
  );
  
  static const TextStyle labelMedium = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.2,
  );
  
  static const TextStyle caption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    height: 1.3,
  );
}
```

#### Spacing System
```dart
class DriverAppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
  static const double xxxl = 64.0;
}
```

#### Component Specifications

##### Touch Targets
- **Minimum Size**: 48dp x 48dp (accessible standard)
- **Primary Buttons**: 56dp height, full width or minimum 200dp width
- **Icon Buttons**: 48dp x 48dp minimum
- **List Items**: 64dp minimum height for single line, 88dp for two lines
- **Tab Bar Items**: 48dp height minimum

##### Card Components
- **Elevation**: 2dp for cards, 4dp for elevated cards, 8dp for modals
- **Corner Radius**: 12dp standard, 16dp for prominent cards
- **Padding**: 16dp standard, 20dp for content cards, 24dp for modal content
- **Margins**: 16dp between cards, 24dp screen margins

##### Form Elements
- **Input Fields**: 56dp height, 12dp corner radius
- **Dropdowns**: 56dp height, full width
- **Checkboxes/Radio**: 20dp size with 28dp touch target
- **Switches**: Standard Material Design sizing

### Screen Layout Patterns

#### Mobile-First Approach
- **Portrait Orientation**: Primary design focus
- **Landscape Support**: Critical features accessible in landscape
- **Tablet Support**: Responsive layout with proper spacing
- **Safe Areas**: Full respect for device safe areas and notches

#### Navigation Patterns
- **Bottom Navigation**: 5 main sections with icons and labels
- **Tab Navigation**: Sub-sections within main areas
- **Stack Navigation**: Drill-down for detailed views
- **Modal Navigation**: Overlays for forms and confirmations

#### Content Hierarchy
- **Primary Actions**: Bottom right FAB or primary button placement
- **Secondary Actions**: Overflow menu or secondary button row
- **Tertiary Actions**: Accessible through long-press or swipe gestures
- **Content Grouping**: Card-based layout with clear visual separation

## Technical Architecture

### Project Setup & Dependencies

#### pubspec.yaml Configuration
```yaml
name: freightops_driver
description: FreightOps Pro Driver Mobile Application
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=3.16.0"

dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.1
  
  # Networking & API
  http: ^1.1.0
  dio: ^5.4.0                    # Advanced HTTP client
  json_annotation: ^4.8.1
  
  # Local Storage
  sqflite: ^2.3.0
  shared_preferences: ^2.2.2
  hive: ^2.2.3                   # Fast key-value database
  hive_flutter: ^1.1.0
  
  # Location & Navigation
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  google_maps_flutter: ^2.5.0
  location: ^5.0.3
  
  # Device Features
  permission_handler: ^11.1.0
  device_info_plus: ^9.1.1
  package_info_plus: ^4.2.0
  connectivity_plus: ^5.0.2
  
  # Background Processing
  workmanager: ^0.5.2
  background_fetch: ^1.3.6
  
  # Notifications
  flutter_local_notifications: ^16.3.0
  firebase_messaging: ^14.7.10
  
  # Media & Camera
  camera: ^0.10.5+5
  image_picker: ^1.0.4
  image_cropper: ^5.0.1
  path_provider: ^2.1.1
  
  # Documents & Files
  pdf: ^3.10.7
  printing: ^5.12.0
  file_picker: ^6.1.1
  open_file: ^3.3.2
  
  # Audio & Voice
  speech_to_text: ^6.6.0
  flutter_tts: ^3.8.3
  audioplayers: ^5.2.1
  
  # UI & UX
  cupertino_icons: ^1.0.6
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  lottie: ^2.7.0
  
  # Utilities
  intl: ^0.18.1
  uuid: ^4.2.2
  crypto: ^3.0.3
  url_launcher: ^6.2.2
  share_plus: ^7.2.1
  
  # Development
  flutter_launcher_icons: ^0.13.1
  flutter_native_splash: ^2.3.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
  hive_generator: ^2.0.1
  mockito: ^5.4.4
  integration_test:
    sdk: flutter

# App Icons Configuration
flutter_launcher_icons:
  android: "launcher_icon"
  ios: true
  image_path: "assets/icons/app_icon.png"
  min_sdk_android: 21
  web:
    generate: true
    image_path: "assets/icons/app_icon.png"
    background_color: "#2563EB"
    theme_color: "#2563EB"

# Splash Screen Configuration
flutter_native_splash:
  color: "#2563EB"
  image: assets/icons/splash_icon.png
  branding: assets/images/freightops_logo.png
  android_12:
    image: assets/icons/splash_icon.png
    icon_background_color: "#2563EB"

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
    - assets/animations/
    - assets/sounds/
  
  fonts:
    - family: Inter
      fonts:
        - asset: fonts/Inter-Regular.ttf
        - asset: fonts/Inter-Medium.ttf
          weight: 500
        - asset: fonts/Inter-SemiBold.ttf
          weight: 600
        - asset: fonts/Inter-Bold.ttf
          weight: 700
```

### Directory Structure & Architecture
```
lib/
├── main.dart                          # App entry point
├── app.dart                           # Main app widget
├── core/                              # Core application logic
│   ├── constants/                     # App constants
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   ├── storage_keys.dart
│   │   └── routes.dart
│   ├── errors/                        # Error handling
│   │   ├── exceptions.dart
│   │   ├── failures.dart
│   │   └── error_handler.dart
│   ├── network/                       # Network configuration
│   │   ├── api_client.dart
│   │   ├── network_info.dart
│   │   └── interceptors.dart
│   ├── utils/                         # Utility functions
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   ├── date_utils.dart
│   │   └── permission_handler.dart
│   └── theme/                         # App theming
│       ├── app_theme.dart
│       ├── colors.dart
│       ├── text_styles.dart
│       └── spacing.dart
├── data/                              # Data layer
│   ├── datasources/                   # Data sources
│   │   ├── local/
│   │   │   ├── driver_local_datasource.dart
│   │   │   ├── load_local_datasource.dart
│   │   │   ├── hours_local_datasource.dart
│   │   │   └── database_helper.dart
│   │   └── remote/
│   │       ├── driver_remote_datasource.dart
│   │       ├── load_remote_datasource.dart
│   │       ├── hours_remote_datasource.dart
│   │       └── auth_remote_datasource.dart
│   ├── models/                        # Data models
│   │   ├── driver_model.dart
│   │   ├── load_model.dart
│   │   ├── hours_model.dart
│   │   ├── inspection_model.dart
│   │   ├── location_model.dart
│   │   └── api_response_model.dart
│   └── repositories/                  # Repository implementations
│       ├── driver_repository_impl.dart
│       ├── load_repository_impl.dart
│       ├── hours_repository_impl.dart
│       └── auth_repository_impl.dart
├── domain/                            # Business logic layer
│   ├── entities/                      # Business entities
│   │   ├── driver.dart
│   │   ├── load.dart
│   │   ├── hours_of_service.dart
│   │   ├── inspection.dart
│   │   └── user.dart
│   ├── repositories/                  # Repository interfaces
│   │   ├── driver_repository.dart
│   │   ├── load_repository.dart
│   │   ├── hours_repository.dart
│   │   └── auth_repository.dart
│   └── usecases/                      # Use cases
│       ├── auth/
│       │   ├── login_usecase.dart
│       │   ├── logout_usecase.dart
│       │   └── check_auth_status_usecase.dart
│       ├── driver/
│       │   ├── get_driver_profile_usecase.dart
│       │   ├── update_driver_status_usecase.dart
│       │   └── get_driver_location_usecase.dart
│       ├── loads/
│       │   ├── get_available_loads_usecase.dart
│       │   ├── accept_load_usecase.dart
│       │   ├── update_load_status_usecase.dart
│       │   └── complete_load_usecase.dart
│       └── hours/
│           ├── get_hours_status_usecase.dart
│           ├── update_duty_status_usecase.dart
│           └── get_hours_history_usecase.dart
├── presentation/                      # UI layer
│   ├── providers/                     # State management
│   │   ├── auth_provider.dart
│   │   ├── driver_provider.dart
│   │   ├── load_provider.dart
│   │   ├── hours_provider.dart
│   │   ├── inspection_provider.dart
│   │   └── location_provider.dart
│   ├── screens/                       # Screen widgets
│   │   ├── splash/
│   │   │   └── splash_screen.dart
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   ├── forgot_password_screen.dart
│   │   │   └── change_password_screen.dart
│   │   ├── dashboard/
│   │   │   ├── dashboard_screen.dart
│   │   │   ├── overview_tab.dart
│   │   │   ├── notifications_screen.dart
│   │   │   └── quick_actions_screen.dart
│   │   ├── hours/
│   │   │   ├── hours_screen.dart
│   │   │   ├── hours_current_tab.dart
│   │   │   ├── hours_logs_tab.dart
│   │   │   ├── hours_clock_tab.dart
│   │   │   └── duty_status_change_screen.dart
│   │   ├── loads/
│   │   │   ├── loads_screen.dart
│   │   │   ├── active_loads_tab.dart
│   │   │   ├── available_loads_tab.dart
│   │   │   ├── load_history_tab.dart
│   │   │   ├── load_detail_screen.dart
│   │   │   └── load_documents_screen.dart
│   │   ├── inspection/
│   │   │   ├── inspection_screen.dart
│   │   │   ├── inspection_form_screen.dart
│   │   │   ├── inspection_history_screen.dart
│   │   │   └── defect_report_screen.dart
│   │   ├── profile/
│   │   │   ├── profile_screen.dart
│   │   │   ├── settings_screen.dart
│   │   │   ├── documents_screen.dart
│   │   │   └── help_screen.dart
│   │   └── common/
│   │       ├── error_screen.dart
│   │       ├── no_internet_screen.dart
│   │       └── maintenance_screen.dart
│   └── widgets/                       # Reusable widgets
│       ├── common/
│       │   ├── custom_app_bar.dart
│       │   ├── custom_bottom_nav.dart
│       │   ├── loading_widget.dart
│       │   ├── error_widget.dart
│       │   ├── empty_state_widget.dart
│       │   └── confirmation_dialog.dart
│       ├── forms/
│       │   ├── custom_text_field.dart
│       │   ├── custom_dropdown.dart
│       │   ├── custom_checkbox.dart
│       │   ├── custom_button.dart
│       │   └── signature_pad.dart
│       ├── cards/
│       │   ├── driver_status_card.dart
│       │   ├── hours_summary_card.dart
│       │   ├── load_card.dart
│       │   ├── inspection_item_card.dart
│       │   └── metric_card.dart
│       ├── lists/
│       │   ├── load_list_item.dart
│       │   ├── hours_log_item.dart
│       │   ├── inspection_list_item.dart
│       │   └── notification_list_item.dart
│       └── overlays/
│           ├── status_change_modal.dart
│           ├── photo_capture_modal.dart
│           ├── voice_input_modal.dart
│           └── map_overlay.dart
└── services/                          # Platform services
    ├── location_service.dart
    ├── notification_service.dart
    ├── camera_service.dart
    ├── voice_service.dart
    ├── sync_service.dart
    ├── background_service.dart
    └── security_service.dart
```

### Dependency Injection Setup
```dart
// core/di/injection_container.dart
import 'package:get_it/get_it.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite/sqflite.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // External dependencies
  final sharedPreferences = await SharedPreferences.getInstance();
  final database = await _initDatabase();
  
  sl.registerLazySingleton(() => sharedPreferences);
  sl.registerLazySingleton(() => database);
  sl.registerLazySingleton(() => http.Client());
  
  // Core
  sl.registerLazySingleton<NetworkInfo>(() => NetworkInfoImpl(sl()));
  sl.registerLazySingleton<ApiClient>(() => ApiClient(sl()));
  
  // Data sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(apiClient: sl()),
  );
  sl.registerLazySingleton<DriverRemoteDataSource>(
    () => DriverRemoteDataSourceImpl(apiClient: sl()),
  );
  sl.registerLazySingleton<DriverLocalDataSource>(
    () => DriverLocalDataSourceImpl(database: sl()),
  );
  
  // Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
      networkInfo: sl(),
    ),
  );
  sl.registerLazySingleton<DriverRepository>(
    () => DriverRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
      networkInfo: sl(),
    ),
  );
  
  // Use cases
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));
  sl.registerLazySingleton(() => GetDriverProfileUseCase(sl()));
  sl.registerLazySingleton(() => UpdateDriverStatusUseCase(sl()));
  
  // Providers
  sl.registerFactory(() => AuthProvider(
    loginUseCase: sl(),
    logoutUseCase: sl(),
    checkAuthStatusUseCase: sl(),
  ));
  sl.registerFactory(() => DriverProvider(
    getDriverProfileUseCase: sl(),
    updateDriverStatusUseCase: sl(),
  ));
  
  // Services
  sl.registerLazySingleton<LocationService>(() => LocationServiceImpl());
  sl.registerLazySingleton<NotificationService>(() => NotificationServiceImpl());
  sl.registerLazySingleton<CameraService>(() => CameraServiceImpl());
}

Future<Database> _initDatabase() async {
  final databasesPath = await getDatabasesPath();
  final path = join(databasesPath, 'freightops_driver.db');
  
  return await openDatabase(
    path,
    version: 1,
    onCreate: (Database db, int version) async {
      // Create tables
      await db.execute('''
        CREATE TABLE drivers (
          id TEXT PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          driver_number TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          status TEXT NOT NULL,
          current_location TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      ''');
      
      await db.execute('''
        CREATE TABLE loads (
          id TEXT PRIMARY KEY,
          load_number TEXT NOT NULL,
          status TEXT NOT NULL,
          pickup_location TEXT NOT NULL,
          delivery_location TEXT NOT NULL,
          pickup_date TEXT NOT NULL,
          delivery_date TEXT NOT NULL,
          customer_name TEXT NOT NULL,
          rate REAL NOT NULL,
          miles INTEGER,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      ''');
      
      await db.execute('''
        CREATE TABLE hours_logs (
          id TEXT PRIMARY KEY,
          driver_id TEXT NOT NULL,
          duty_status TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          location TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (driver_id) REFERENCES drivers (id)
        )
      ''');
    },
  );
}
```

## Component Library

### 1. Core Design Components

#### Custom App Bar
```dart
// presentation/widgets/common/custom_app_bar.dart
class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final PreferredSizeWidget? bottom;
  final double elevation;

  const CustomAppBar({
    Key? key,
    required this.title,
    this.actions,
    this.leading,
    this.centerTitle = true,
    this.backgroundColor,
    this.foregroundColor,
    this.bottom,
    this.elevation = 0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(
        title,
        style: DriverAppTextStyles.h4.copyWith(
          color: foregroundColor ?? DriverAppColors.textOnPrimary,
          fontWeight: FontWeight.w600,
        ),
      ),
      backgroundColor: backgroundColor ?? DriverAppColors.primary,
      foregroundColor: foregroundColor ?? DriverAppColors.textOnPrimary,
      centerTitle: centerTitle,
      elevation: elevation,
      leading: leading,
      actions: actions,
      bottom: bottom,
      systemOverlayStyle: SystemUiOverlayStyle.light,
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(
    kToolbarHeight + (bottom?.preferredSize.height ?? 0),
  );
}
```

#### Custom Bottom Navigation
```dart
// presentation/widgets/common/custom_bottom_nav.dart
class CustomBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final List<BottomNavItem> items;

  const CustomBottomNavigation({
    Key? key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: DriverAppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: DriverAppSpacing.sm),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: items.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              final isSelected = index == currentIndex;
              
              return GestureDetector(
                onTap: () => onTap(index),
                child: AnimatedContainer(
                  duration: Duration(milliseconds: 200),
                  padding: EdgeInsets.symmetric(
                    horizontal: DriverAppSpacing.md,
                    vertical: DriverAppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected 
                        ? DriverAppColors.primary.withOpacity(0.1)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        item.icon,
                        color: isSelected 
                            ? DriverAppColors.primary
                            : DriverAppColors.textSecondary,
                        size: 24,
                      ),
                      SizedBox(height: 4),
                      Text(
                        item.label,
                        style: DriverAppTextStyles.caption.copyWith(
                          color: isSelected 
                              ? DriverAppColors.primary
                              : DriverAppColors.textSecondary,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class BottomNavItem {
  final IconData icon;
  final String label;
  final String route;

  const BottomNavItem({
    required this.icon,
    required this.label,
    required this.route,
  });
}
```

#### Custom Text Field
```dart
// presentation/widgets/forms/custom_text_field.dart
class CustomTextField extends StatefulWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final VoidCallback? onTap;
  final bool readOnly;
  final int? maxLines;
  final int? maxLength;
  final bool enabled;
  final FocusNode? focusNode;
  final TextInputAction? textInputAction;
  final void Function(String)? onChanged;
  final void Function(String)? onSubmitted;

  const CustomTextField({
    Key? key,
    required this.controller,
    required this.label,
    this.hint,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.onTap,
    this.readOnly = false,
    this.maxLines = 1,
    this.maxLength,
    this.enabled = true,
    this.focusNode,
    this.textInputAction,
    this.onChanged,
    this.onSubmitted,
  }) : super(key: key);

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  bool _obscureText = false;
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.obscureText;
    _focusNode = widget.focusNode ?? FocusNode();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: DriverAppTextStyles.labelMedium.copyWith(
            color: DriverAppColors.textPrimary,
          ),
        ),
        SizedBox(height: DriverAppSpacing.sm),
        TextFormField(
          controller: widget.controller,
          focusNode: _focusNode,
          obscureText: _obscureText,
          keyboardType: widget.keyboardType,
          validator: widget.validator,
          onTap: widget.onTap,
          readOnly: widget.readOnly,
          maxLines: widget.maxLines,
          maxLength: widget.maxLength,
          enabled: widget.enabled,
          textInputAction: widget.textInputAction,
          onChanged: widget.onChanged,
          onFieldSubmitted: widget.onSubmitted,
          style: DriverAppTextStyles.bodyMedium,
          decoration: InputDecoration(
            hintText: widget.hint,
            prefixIcon: widget.prefixIcon != null 
                ? Icon(widget.prefixIcon, size: 20) 
                : null,
            suffixIcon: widget.obscureText
                ? IconButton(
                    icon: Icon(
                      _obscureText ? Icons.visibility : Icons.visibility_off,
                      size: 20,
                    ),
                    onPressed: () {
                      setState(() {
                        _obscureText = !_obscureText;
                      });
                    },
                  )
                : widget.suffixIcon,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: DriverAppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: DriverAppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: DriverAppColors.borderFocus, width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: DriverAppColors.borderError, width: 2),
            ),
            filled: true,
            fillColor: widget.enabled ? DriverAppColors.surface : DriverAppColors.surfaceVariant,
            contentPadding: EdgeInsets.symmetric(
              horizontal: DriverAppSpacing.md,
              vertical: DriverAppSpacing.md,
            ),
            counterText: '',
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose();
    }
    super.dispose();
  }
}
```

#### Custom Button
```dart
// presentation/widgets/forms/custom_button.dart
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final Color? backgroundColor;
  final Color? textColor;
  final Color? borderColor;
  final double height;
  final double? width;
  final double borderRadius;
  final IconData? icon;
  final double fontSize;
  final FontWeight fontWeight;

  const CustomButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.backgroundColor,
    this.textColor,
    this.borderColor,
    this.height = 56,
    this.width,
    this.borderRadius = 12,
    this.icon,
    this.fontSize = 16,
    this.fontWeight = FontWeight.w600,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bool isEnabled = onPressed != null && !isLoading;
    
    return SizedBox(
      width: width ?? double.infinity,
      height: height,
      child: isOutlined ? _buildOutlinedButton(isEnabled) : _buildElevatedButton(isEnabled),
    );
  }

  Widget _buildElevatedButton(bool isEnabled) {
    return ElevatedButton(
      onPressed: isEnabled ? onPressed : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor ?? DriverAppColors.primary,
        foregroundColor: textColor ?? DriverAppColors.textOnPrimary,
        disabledBackgroundColor: DriverAppColors.textTertiary,
        disabledForegroundColor: DriverAppColors.surface,
        elevation: isEnabled ? 2 : 0,
        shadowColor: DriverAppColors.primary.withOpacity(0.3),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
      child: _buildButtonChild(),
    );
  }

  Widget _buildOutlinedButton(bool isEnabled) {
    return OutlinedButton(
      onPressed: isEnabled ? onPressed : null,
      style: OutlinedButton.styleFrom(
        foregroundColor: textColor ?? DriverAppColors.primary,
        disabledForegroundColor: DriverAppColors.textTertiary,
        side: BorderSide(
          color: isEnabled 
              ? (borderColor ?? DriverAppColors.primary)
              : DriverAppColors.textTertiary,
          width: 1.5,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
      child: _buildButtonChild(),
    );
  }

  Widget _buildButtonChild() {
    if (isLoading) {
      return SizedBox(
        width: 24,
        height: 24,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            isOutlined 
                ? (textColor ?? DriverAppColors.primary)
                : (textColor ?? DriverAppColors.textOnPrimary),
          ),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 20),
          SizedBox(width: DriverAppSpacing.sm),
          Text(
            text,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: fontWeight,
            ),
          ),
        ],
      );
    }

    return Text(
      text,
      style: TextStyle(
        fontSize: fontSize,
        fontWeight: fontWeight,
      ),
    );
  }
}
```

### 2. Status and Information Cards

#### Driver Status Card
```dart
// presentation/widgets/cards/driver_status_card.dart
class DriverStatusCard extends StatelessWidget {
  final Driver driver;
  final DriverStatus status;
  final VoidCallback? onStatusTap;

  const DriverStatusCard({
    Key? key,
    required this.driver,
    required this.status,
    this.onStatusTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: EdgeInsets.all(DriverAppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _buildDriverAvatar(),
                SizedBox(width: DriverAppSpacing.md),
                Expanded(child: _buildDriverInfo()),
                _buildStatusIndicator(),
              ],
            ),
            SizedBox(height: DriverAppSpacing.md),
            _buildStatusDetails(),
          ],
        ),
      ),
    );
  }

  Widget _buildDriverAvatar() {
    return Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: DriverAppColors.primary,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Center(
        child: Text(
          '${driver.firstName[0]}${driver.lastName[0]}',
          style: DriverAppTextStyles.h4.copyWith(
            color: DriverAppColors.textOnPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  Widget _buildDriverInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${driver.firstName} ${driver.lastName}',
          style: DriverAppTextStyles.h4.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 2),
        Text(
          'Driver #${driver.driverNumber}',
          style: DriverAppTextStyles.bodySmall.copyWith(
            color: DriverAppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusIndicator() {
    return GestureDetector(
      onTap: onStatusTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: DriverAppSpacing.md,
          vertical: DriverAppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: _getStatusColor().withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: _getStatusColor(),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: _getStatusColor(),
                shape: BoxShape.circle,
              ),
            ),
            SizedBox(width: DriverAppSpacing.sm),
            Text(
              _getStatusText(),
              style: DriverAppTextStyles.labelMedium.copyWith(
                color: _getStatusColor(),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusDetails() {
    return Row(
      children: [
        Expanded(
          child: _buildInfoItem(
            'Current Location',
            driver.currentLocation ?? 'Unknown',
            Icons.location_on,
          ),
        ),
        SizedBox(width: DriverAppSpacing.md),
        Expanded(
          child: _buildInfoItem(
            'Last Update',
            _formatLastUpdate(driver.lastUpdate),
            Icons.access_time,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoItem(String label, String value, IconData icon) {
    return Container(
      padding: EdgeInsets.all(DriverAppSpacing.md),
      decoration: BoxDecoration(
        color: DriverAppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                size: 16,
                color: DriverAppColors.textSecondary,
              ),
              SizedBox(width: DriverAppSpacing.sm),
              Text(
                label,
                style: DriverAppTextStyles.caption.copyWith(
                  color: DriverAppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          SizedBox(height: 4),
          Text(
            value,
            style: DriverAppTextStyles.bodySmall.copyWith(
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Color _getStatusColor() {
    switch (status) {
      case DriverStatus.driving:
        return DriverAppColors.success;
      case DriverStatus.onDuty:
        return DriverAppColors.info;
      case DriverStatus.sleeperBerth:
        return DriverAppColors.warning;
      case DriverStatus.offDuty:
        return DriverAppColors.textSecondary;
      default:
        return DriverAppColors.textSecondary;
    }
  }

  String _getStatusText() {
    switch (status) {
      case DriverStatus.driving:
        return 'Driving';
      case DriverStatus.onDuty:
        return 'On Duty';
      case DriverStatus.sleeperBerth:
        return 'Sleeper Berth';
      case DriverStatus.offDuty:
        return 'Off Duty';
      default:
        return 'Unknown';
    }
  }

  String _formatLastUpdate(DateTime? lastUpdate) {
    if (lastUpdate == null) return 'Never';
    
    final now = DateTime.now();
    final difference = now.difference(lastUpdate);
    
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }
}
```

#### Hours Summary Card
```dart
// presentation/widgets/cards/hours_summary_card.dart
class HoursSummaryCard extends StatelessWidget {
  final HoursOfService hoursStatus;
  final VoidCallback? onTap;

  const HoursSummaryCard({
    Key? key,
    required this.hoursStatus,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: EdgeInsets.all(DriverAppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              SizedBox(height: DriverAppSpacing.md),
              _buildHoursGrid(),
              SizedBox(height: DriverAppSpacing.md),
              _buildProgressIndicators(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: DriverAppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            Icons.access_time,
            color: DriverAppColors.primary,
            size: 20,
          ),
        ),
        SizedBox(width: DriverAppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hours of Service',
                style: DriverAppTextStyles.h4.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'Current duty period',
                style: DriverAppTextStyles.bodySmall.copyWith(
                  color: DriverAppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        Icon(
          Icons.arrow_forward_ios,
          color: DriverAppColors.textSecondary,
          size: 16,
        ),
      ],
    );
  }

  Widget _buildHoursGrid() {
    return Row(
      children: [
        Expanded(
          child: _buildHoursItem(
            'Drive Time',
            hoursStatus.remainingDriveTime,
            _getTimeColor(hoursStatus.remainingDriveTime),
          ),
        ),
        SizedBox(width: DriverAppSpacing.md),
        Expanded(
          child: _buildHoursItem(
            'On Duty',
            hoursStatus.remainingOnDutyTime,
            _getTimeColor(hoursStatus.remainingOnDutyTime),
          ),
        ),
      ],
    );
  }

  Widget _buildHoursItem(String label, Duration remaining, Color color) {
    final hours = remaining.inHours;
    final minutes = remaining.inMinutes % 60;
    
    return Container(
      padding: EdgeInsets.all(DriverAppSpacing.md),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: DriverAppTextStyles.caption.copyWith(
              color: DriverAppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 4),
          Text(
            '${hours}h ${minutes}m',
            style: DriverAppTextStyles.h4.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressIndicators() {
    return Column(
      children: [
        _buildProgressBar(
          'Daily Progress',
          hoursStatus.dailyProgress,
          DriverAppColors.primary,
        ),
        SizedBox(height: DriverAppSpacing.sm),
        _buildProgressBar(
          'Weekly Progress',
          hoursStatus.weeklyProgress,
          DriverAppColors.info,
        ),
      ],
    );
  }

  Widget _buildProgressBar(String label, double progress, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: DriverAppTextStyles.caption.copyWith(
                color: DriverAppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              '${(progress * 100).toInt()}%',
              style: DriverAppTextStyles.caption.copyWith(
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        SizedBox(height: 4),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: DriverAppColors.surfaceVariant,
          valueColor: AlwaysStoppedAnimation<Color>(color),
          minHeight: 6,
          borderRadius: BorderRadius.circular(3),
        ),
      ],
    );
  }

  Color _getTimeColor(Duration remaining) {
    if (remaining.inMinutes < 60) return DriverAppColors.error;
    if (remaining.inMinutes < 120) return DriverAppColors.warning;
    return DriverAppColors.success;
  }
}
```

## Page Implementations

### 1. Authentication Screens

#### Login Screen
```dart
// presentation/screens/auth/login_screen.dart
class LoginScreen extends StatefulWidget {
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emailFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();
  
  bool _isLoading = false;
  bool _rememberMe = false;
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _loadSavedCredentials();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DriverAppColors.background,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(DriverAppSpacing.lg),
          child: Column(
            children: [
              Expanded(
                flex: 2,
                child: _buildHeader(),
              ),
              Expanded(
                flex: 3,
                child: _buildLoginForm(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: DriverAppColors.primary,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: DriverAppColors.primary.withOpacity(0.3),
                blurRadius: 20,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: Icon(
            Icons.local_shipping,
            color: DriverAppColors.textOnPrimary,
            size: 60,
          ),
        ),
        SizedBox(height: DriverAppSpacing.lg),
        Text(
          'FreightOps Pro',
          style: DriverAppTextStyles.h1.copyWith(
            color: DriverAppColors.textPrimary,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: DriverAppSpacing.sm),
        Text(
          'Driver Portal',
          style: DriverAppTextStyles.bodyLarge.copyWith(
            color: DriverAppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildLoginForm() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          CustomTextField(
            controller: _emailController,
            focusNode: _emailFocusNode,
            label: 'Email Address',
            hint: 'Enter your email',
            prefixIcon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            validator: _validateEmail,
            onSubmitted: (_) => _passwordFocusNode.requestFocus(),
          ),
          
          SizedBox(height: DriverAppSpacing.md),
          
          CustomTextField(
            controller: _passwordController,
            focusNode: _passwordFocusNode,
            label: 'Password',
            hint: 'Enter your password',
            prefixIcon: Icons.lock_outlined,
            obscureText: _obscurePassword,
            textInputAction: TextInputAction.done,
            validator: _validatePassword,
            onSubmitted: (_) => _handleLogin(),
            suffixIcon: IconButton(
              icon: Icon(
                _obscurePassword ? Icons.visibility : Icons.visibility_off,
                color: DriverAppColors.textSecondary,
              ),
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
            ),
          ),
          
          SizedBox(height: DriverAppSpacing.md),
          
          Row(
            children: [
              Checkbox(
                value: _rememberMe,
                onChanged: (value) {
                  setState(() {
                    _rememberMe = value ?? false;
                  });
                },
                activeColor: DriverAppColors.primary,
              ),
              Text(
                'Remember me',
                style: DriverAppTextStyles.bodyMedium,
              ),
              Spacer(),
              TextButton(
                onPressed: _handleForgotPassword,
                child: Text(
                  'Forgot Password?',
                  style: DriverAppTextStyles.bodyMedium.copyWith(
                    color: DriverAppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          
          SizedBox(height: DriverAppSpacing.xl),
          
          CustomButton(
            text: 'Sign In',
            isLoading: _isLoading,
            onPressed: _handleLogin,
          ),
          
          SizedBox(height: DriverAppSpacing.md),
          
          TextButton(
            onPressed: _handleNeedHelp,
            child: Text(
              'Need help signing in?',
              style: DriverAppTextStyles.bodyMedium.copyWith(
                color: DriverAppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String? _validateEmail(String? value) {
    if (value?.isEmpty ?? true) {
      return 'Email is required';
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value!)) {
      return 'Enter a valid email address';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value?.isEmpty ?? true) {
      return 'Password is required';
    }
    if (value!.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }

  void _handleLogin() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() {
        _isLoading = true;
      });
      
      try {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await authProvider.login(
          _emailController.text.trim(),
          _passwordController.text,
          rememberMe: _rememberMe,
        );
        
        if (_rememberMe) {
          await _saveCredentials();
        }
        
        Navigator.pushReplacementNamed(context, '/dashboard');
      } catch (e) {
        _showErrorSnackbar('Login failed: ${e.toString()}');
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _handleForgotPassword() {
    Navigator.pushNamed(context, '/forgot-password');
  }

  void _handleNeedHelp() {
    Navigator.pushNamed(context, '/help');
  }

  void _showErrorSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: DriverAppColors.error,
        behavior: SnackBarBehavior.floating,
        margin: EdgeInsets.all(DriverAppSpacing.md),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  Future<void> _loadSavedCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    final savedEmail = prefs.getString('saved_email');
    final savedRememberMe = prefs.getBool('remember_me') ?? false;
    
    if (savedEmail != null && savedRememberMe) {
      setState(() {
        _emailController.text = savedEmail;
        _rememberMe = savedRememberMe;
      });
    }
  }

  Future<void> _saveCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('saved_email', _emailController.text.trim());
    await prefs.setBool('remember_me', _rememberMe);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    super.dispose();
  }
}
```

### 2. Dashboard Screen Implementation

#### Main Dashboard Screen
```dart
// presentation/screens/dashboard/dashboard_screen.dart
class DashboardScreen extends StatefulWidget {
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  
  final List<BottomNavItem> _navItems = [
    BottomNavItem(icon: Icons.dashboard, label: 'Overview', route: '/overview'),
    BottomNavItem(icon: Icons.access_time, label: 'Hours', route: '/hours'),
    BottomNavItem(icon: Icons.local_shipping, label: 'Loads', route: '/loads'),
    BottomNavItem(icon: Icons.assignment, label: 'Inspection', route: '/inspection'),
    BottomNavItem(icon: Icons.person, label: 'Profile', route: '/profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          OverviewTab(),
          HoursTab(),
          LoadsTab(),
          InspectionTab(),
          ProfileTab(),
        ],
      ),
      bottomNavigationBar: CustomBottomNavigation(
        currentIndex: _currentIndex,
        items: _navItems,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
```

#### Overview Tab Implementation
```dart
// presentation/screens/dashboard/overview_tab.dart
class OverviewTab extends StatefulWidget {
  @override
  State<OverviewTab> createState() => _OverviewTabState();
}

class _OverviewTabState extends State<OverviewTab> {
  final RefreshController _refreshController = RefreshController(initialRefresh: false);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DriverAppColors.background,
      appBar: CustomAppBar(
        title: 'Overview',
        actions: [
          IconButton(
            icon: Icon(Icons.notifications_outlined),
            onPressed: () => Navigator.pushNamed(context, '/notifications'),
          ),
        ],
      ),
      body: Consumer2<DriverProvider, HoursProvider>(
        builder: (context, driverProvider, hoursProvider, child) {
          return SmartRefresher(
            controller: _refreshController,
            onRefresh: _onRefresh,
            child: SingleChildScrollView(
              padding: EdgeInsets.all(DriverAppSpacing.md),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Welcome section
                  _buildWelcomeSection(driverProvider.currentDriver),
                  
                  SizedBox(height: DriverAppSpacing.lg),
                  
                  // Driver status card
                  if (driverProvider.currentDriver != null)
                    DriverStatusCard(
                      driver: driverProvider.currentDriver!,
                      status: driverProvider.currentStatus,
                      onStatusTap: () => _showStatusChangeModal(context),
                    ),
                  
                  SizedBox(height: DriverAppSpacing.md),
                  
                  // Hours summary card
                  if (hoursProvider.currentStatus != null)
                    HoursSummaryCard(
                      hoursStatus: hoursProvider.currentStatus!,
                      onTap: () => _navigateToTab(1), // Hours tab
                    ),
                  
                  SizedBox(height: DriverAppSpacing.md),
                  
                  // Current load section
                  _buildCurrentLoadSection(driverProvider.currentLoad),
                  
                  SizedBox(height: DriverAppSpacing.md),
                  
                  // Quick actions grid
                  _buildQuickActionsGrid(),
                  
                  SizedBox(height: DriverAppSpacing.md),
                  
                  // Recent activity
                  _buildRecentActivitySection(),
                  
                  SizedBox(height: DriverAppSpacing.md),
                  
                  // Weather and traffic info
                  _buildWeatherTrafficSection(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildWelcomeSection(Driver? driver) {
    final hour = DateTime.now().hour;
    String greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';

    return Container(
      padding: EdgeInsets.all(DriverAppSpacing.lg),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            DriverAppColors.primary,
            DriverAppColors.primaryDark,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$greeting,',
                  style: DriverAppTextStyles.bodyLarge.copyWith(
                    color: DriverAppColors.textOnPrimary.withOpacity(0.8),
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  driver?.firstName ?? 'Driver',
                  style: DriverAppTextStyles.h2.copyWith(
                    color: DriverAppColors.textOnPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: DriverAppSpacing.sm),
                Text(
                  'Have a safe journey today',
                  style: DriverAppTextStyles.bodyMedium.copyWith(
                    color: DriverAppColors.textOnPrimary.withOpacity(0.9),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: DriverAppColors.textOnPrimary.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.wb_sunny,
              color: DriverAppColors.textOnPrimary,
              size: 32,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentLoadSection(Load? currentLoad) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Current Load',
              style: DriverAppTextStyles.h4.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            if (currentLoad != null)
              TextButton(
                onPressed: () => Navigator.pushNamed(
                  context, 
                  '/load-detail',
                  arguments: currentLoad,
                ),
                child: Text('View Details'),
              ),
          ],
        ),
        SizedBox(height: DriverAppSpacing.sm),
        if (currentLoad != null)
          LoadCard(
            load: currentLoad,
            onTap: () => Navigator.pushNamed(
              context,
              '/load-detail',
              arguments: currentLoad,
            ),
          )
        else
          _buildNoLoadCard(),
      ],
    );
  }

  Widget _buildNoLoadCard() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: EdgeInsets.all(DriverAppSpacing.lg),
        child: Column(
          children: [
            Icon(
              Icons.inbox_outlined,
              size: 48,
              color: DriverAppColors.textSecondary,
            ),
            SizedBox(height: DriverAppSpacing.md),
            Text(
              'No Active Load',
              style: DriverAppTextStyles.h4.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: DriverAppSpacing.sm),
            Text(
              'Check available loads or contact dispatch for your next assignment.',
              style: DriverAppTextStyles.bodyMedium.copyWith(
                color: DriverAppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: DriverAppSpacing.md),
            CustomButton(
              text: 'View Available Loads',
              isOutlined: true,
              onPressed: () => _navigateToTab(2), // Loads tab
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionsGrid() {
    final actions = [
      QuickAction(
        icon: Icons.add_road,
        label: 'Log Hours',
        color: DriverAppColors.success,
        onTap: () => _navigateToTab(1),
      ),
      QuickAction(
        icon: Icons.assignment_turned_in,
        label: 'Inspection',
        color: DriverAppColors.info,
        onTap: () => _navigateToTab(3),
      ),
      QuickAction(
        icon: Icons.message,
        label: 'Messages',
        color: DriverAppColors.warning,
        onTap: () => Navigator.pushNamed(context, '/messages'),
      ),
      QuickAction(
        icon: Icons.help_outline,
        label: 'Support',
        color: DriverAppColors.error,
        onTap: () => Navigator.pushNamed(context, '/support'),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: DriverAppTextStyles.h4.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: DriverAppSpacing.sm),
        GridView.builder(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: DriverAppSpacing.md,
            mainAxisSpacing: DriverAppSpacing.md,
            childAspectRatio: 1.2,
          ),
          itemCount: actions.length,
          itemBuilder: (context, index) {
            final action = actions[index];
            return QuickActionCard(action: action);
          },
        ),
      ],
    );
  }

  Widget _buildRecentActivitySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Activity',
              style: DriverAppTextStyles.h4.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pushNamed(context, '/activity'),
              child: Text('View All'),
            ),
          ],
        ),
        SizedBox(height: DriverAppSpacing.sm),
        Card(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: [
              ActivityListItem(
                icon: Icons.local_shipping,
                title: 'Load #1234 Delivered',
                subtitle: 'Completed delivery at 2:30 PM',
                time: '2 hours ago',
                color: DriverAppColors.success,
              ),
              Divider(height: 1),
              ActivityListItem(
                icon: Icons.access_time,
                title: 'Duty Status Changed',
                subtitle: 'Changed to On Duty',
                time: '4 hours ago',
                color: DriverAppColors.info,
              ),
              Divider(height: 1),
              ActivityListItem(
                icon: Icons.assignment,
                title: 'Pre-Trip Inspection',
                subtitle: 'Completed with no defects',
                time: '6 hours ago',
                color: DriverAppColors.primary,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildWeatherTrafficSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Conditions',
          style: DriverAppTextStyles.h4.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: DriverAppSpacing.sm),
        Row(
          children: [
            Expanded(
              child: Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: EdgeInsets.all(DriverAppSpacing.md),
                  child: Column(
                    children: [
                      Icon(
                        Icons.wb_sunny,
                        color: DriverAppColors.warning,
                        size: 32,
                      ),
                      SizedBox(height: DriverAppSpacing.sm),
                      Text(
                        '72°F',
                        style: DriverAppTextStyles.h3.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Clear Skies',
                        style: DriverAppTextStyles.bodySmall.copyWith(
                          color: DriverAppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(width: DriverAppSpacing.md),
            Expanded(
              child: Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: EdgeInsets.all(DriverAppSpacing.md),
                  child: Column(
                    children: [
                      Icon(
                        Icons.traffic,
                        color: DriverAppColors.success,
                        size: 32,
                      ),
                      SizedBox(height: DriverAppSpacing.sm),
                      Text(
                        'Light',
                        style: DriverAppTextStyles.h3.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Traffic Flow',
                        style: DriverAppTextStyles.bodySmall.copyWith(
                          color: DriverAppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  void _onRefresh() async {
    try {
      await Future.wait([
        Provider.of<DriverProvider>(context, listen: false).refreshData(),
        Provider.of<HoursProvider>(context, listen: false).refreshData(),
      ]);
      _refreshController.refreshCompleted();
    } catch (e) {
      _refreshController.refreshFailed();
    }
  }

  void _navigateToTab(int index) {
    if (mounted) {
      final dashboardState = context.findAncestorStateOfType<_DashboardScreenState>();
      dashboardState?.setState(() {
        dashboardState._currentIndex = index;
      });
    }
  }

  void _showStatusChangeModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatusChangeModal(),
    );
  }
}

// Supporting classes
class QuickAction {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });
}

class QuickActionCard extends StatelessWidget {
  final QuickAction action;

  const QuickActionCard({Key? key, required this.action}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: action.onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: EdgeInsets.all(DriverAppSpacing.md),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: action.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  action.icon,
                  color: action.color,
                  size: 24,
                ),
              ),
              SizedBox(height: DriverAppSpacing.sm),
              Text(
                action.label,
                style: DriverAppTextStyles.labelMedium.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ActivityListItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String time;
  final Color color;

  const ActivityListItem({
    Key? key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.time,
    required this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(DriverAppSpacing.md),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: color,
              size: 20,
            ),
          ),
          SizedBox(width: DriverAppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: DriverAppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  subtitle,
                  style: DriverAppTextStyles.bodySmall.copyWith(
                    color: DriverAppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Text(
            time,
            style: DriverAppTextStyles.caption.copyWith(
              color: DriverAppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
```

### 3. Hours of Service Implementation

#### Hours Screen with Tabs
```dart
// presentation/screens/hours/hours_screen.dart
class HoursScreen extends StatefulWidget {
  @override
  State<HoursScreen> createState() => _HoursScreenState();
}

class _HoursScreenState extends State<HoursScreen> with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DriverAppColors.background,
      appBar: CustomAppBar(
        title: 'Hours of Service',
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: DriverAppColors.textOnPrimary,
          labelColor: DriverAppColors.textOnPrimary,
          unselectedLabelColor: DriverAppColors.textOnPrimary.withOpacity(0.7),
          tabs: [
            Tab(text: 'Current'),
            Tab(text: 'Logs'),
            Tab(text: 'Clock'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          HoursCurrentTab(),
          HoursLogsTab(),
          HoursClockTab(),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
```

#### Hours Current Tab - Real-time HOS tracking
```dart
// presentation/screens/hours/hours_current_tab.dart
class HoursCurrentTab extends StatefulWidget {
  @override
  State<HoursCurrentTab> createState() => _HoursCurrentTabState();
}

class _HoursCurrentTabState extends State<HoursCurrentTab> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(Duration(seconds: 30), (timer) {
      if (mounted) {
        Provider.of<HoursProvider>(context, listen: false).updateCurrentTime();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<HoursProvider>(
      builder: (context, hoursProvider, child) {
        final currentStatus = hoursProvider.currentStatus;
        
        if (currentStatus == null) {
          return Center(
            child: CircularProgressIndicator(),
          );
        }

        return RefreshIndicator(
          onRefresh: () => hoursProvider.refreshData(),
          child: SingleChildScrollView(
            padding: EdgeInsets.all(DriverAppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Current duty status card
                _buildCurrentStatusCard(currentStatus),
                
                SizedBox(height: DriverAppSpacing.md),
                
                // Hours breakdown
                _buildHoursBreakdownCard(currentStatus),
                
                SizedBox(height: DriverAppSpacing.md),
                
                // Remaining hours warnings
                _buildRemainingHoursCard(currentStatus),
                
                SizedBox(height: DriverAppSpacing.md),
                
                // Compliance status
                _buildComplianceCard(currentStatus),
                
                SizedBox(height: DriverAppSpacing.lg),
                
                // Status change buttons
                _buildStatusChangeButtons(currentStatus),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCurrentStatusCard(HoursOfService currentStatus) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(DriverAppSpacing.lg),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              _getStatusColor(currentStatus.currentDutyStatus),
              _getStatusColor(currentStatus.currentDutyStatus).withOpacity(0.8),
            ],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Icon(
              _getStatusIcon(currentStatus.currentDutyStatus),
              color: DriverAppColors.textOnPrimary,
              size: 48,
            ),
            SizedBox(height: DriverAppSpacing.md),
            Text(
              _getStatusText(currentStatus.currentDutyStatus),
              style: DriverAppTextStyles.h2.copyWith(
                color: DriverAppColors.textOnPrimary,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: DriverAppSpacing.sm),
            Text(
              'Since ${_formatTime(currentStatus.currentStatusStartTime)}',
              style: DriverAppTextStyles.bodyMedium.copyWith(
                color: DriverAppColors.textOnPrimary.withOpacity(0.9),
              ),
            ),
            SizedBox(height: DriverAppSpacing.sm),
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: DriverAppSpacing.md,
                vertical: DriverAppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: DriverAppColors.textOnPrimary.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _getElapsedTime(currentStatus.currentStatusStartTime),
                style: DriverAppTextStyles.h3.copyWith(
                  color: DriverAppColors.textOnPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHoursBreakdownCard(HoursOfService currentStatus) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: EdgeInsets.all(DriverAppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Today\'s Hours',
              style: DriverAppTextStyles.h4.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: DriverAppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: _buildHoursSummaryItem(
                    'Driving',
                    currentStatus.drivingTime,
                    DriverAppColors.success,
                    Icons.drive_eta,
                  ),
                ),
                SizedBox(width: DriverAppSpacing.md),
                Expanded(
                  child: _buildHoursSummaryItem(
                    'On Duty',
                    currentStatus.onDutyTime,
                    DriverAppColors.info,
                    Icons.work,
                  ),
                ),
              ],
            ),
            SizedBox(height: DriverAppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: _buildHoursSummaryItem(
                    'Sleeper',
                    currentStatus.sleeperTime,
                    DriverAppColors.warning,
                    Icons.hotel,
                  ),
                ),
                SizedBox(width: DriverAppSpacing.md),
                Expanded(
                  child: _buildHoursSummaryItem(
                    'Off Duty',
                    currentStatus.offDutyTime,
                    DriverAppColors.textSecondary,
                    Icons.power_settings_new,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHoursSummaryItem(String label, Duration duration, Color color, IconData icon) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes % 60;
    
    return Container(
      padding: EdgeInsets.all(DriverAppSpacing.md),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 24,
          ),
          SizedBox(height: DriverAppSpacing.sm),
          Text(
            '${hours}h ${minutes}m',
            style: DriverAppTextStyles.h4.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            label,
            style: DriverAppTextStyles.caption.copyWith(
              color: DriverAppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRemainingHoursCard(HoursOfService currentStatus) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: EdgeInsets.all(DriverAppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Remaining Hours',
              style: DriverAppTextStyles.h4.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: DriverAppSpacing.md),
            _buildRemainingHoursItem(
              'Drive Time',
              currentStatus.remainingDriveTime,
              currentStatus.driveTimeLimit,
            ),
            SizedBox(height: DriverAppSpacing.sm),
            _buildRemainingHoursItem(
              'Duty Time',
              currentStatus.remainingOnDutyTime,
              currentStatus.onDutyTimeLimit,
            ),
            SizedBox(height: DriverAppSpacing.sm),
            _buildRemainingHoursItem(
              'Cycle Time',
              currentStatus.remainingCycleTime,
              currentStatus.cycleTimeLimit,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRemainingHoursItem(String label, Duration remaining, Duration limit) {
    final progress = 1.0 - (remaining.inMinutes / limit.inMinutes);
    final color = _getProgressColor(progress);
    final hours = remaining.inHours;
    final minutes = remaining.inMinutes % 60;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: DriverAppTextStyles.labelMedium,
            ),
            Text(
              '${hours}h ${minutes}m',
              style: DriverAppTextStyles.labelMedium.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        SizedBox(height: 4),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: DriverAppColors.surfaceVariant,
          valueColor: AlwaysStoppedAnimation<Color>(color),
          minHeight: 8,
          borderRadius: BorderRadius.circular(4),
        ),
      ],
    );
  }

  Widget _buildComplianceCard(HoursOfService currentStatus) {
    final violations = currentStatus.violations;
    final hasViolations = violations.isNotEmpty;
    
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: EdgeInsets.all(DriverAppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  hasViolations ? Icons.warning : Icons.check_circle,
                  color: hasViolations ? DriverAppColors.error : DriverAppColors.success,
                  size: 24,
                ),
                SizedBox(width: DriverAppSpacing.sm),
                Text(
                  hasViolations ? 'Compliance Issues' : 'Compliant',
                  style: DriverAppTextStyles.h4.copyWith(
                    fontWeight: FontWeight.bold,
                    color: hasViolations ? DriverAppColors.error : DriverAppColors.success,
                  ),
                ),
              ],
            ),
            if (hasViolations) ...[
              SizedBox(height: DriverAppSpacing.md),
              ...violations.map((violation) => Padding(
                padding: EdgeInsets.only(bottom: DriverAppSpacing.sm),
                child: Row(
                  children: [
                    Icon(
                      Icons.error_outline,
                      color: DriverAppColors.error,
                      size: 16,
                    ),
                    SizedBox(width: DriverAppSpacing.sm),
                    Expanded(
                      child: Text(
                        violation,
                        style: DriverAppTextStyles.bodySmall.copyWith(
                          color: DriverAppColors.error,
                        ),
                      ),
                    ),
                  ],
                ),
              )).toList(),
            ] else
              Padding(
                padding: EdgeInsets.only(top: DriverAppSpacing.sm),
                child: Text(
                  'All DOT regulations are being followed.',
                  style: DriverAppTextStyles.bodyMedium.copyWith(
                    color: DriverAppColors.textSecondary,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChangeButtons(HoursOfService currentStatus) {
    final currentDutyStatus = currentStatus.currentDutyStatus;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Change Status',
          style: DriverAppTextStyles.h4.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: DriverAppSpacing.md),
        GridView.count(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: DriverAppSpacing.md,
          mainAxisSpacing: DriverAppSpacing.md,
          childAspectRatio: 1.5,
          children: DutyStatus.values.map((status) {
            final isCurrentStatus = status == currentDutyStatus;
            final color = _getStatusColor(status);
            
            return CustomButton(
              text: _getStatusText(status),
              backgroundColor: isCurrentStatus ? color.withOpacity(0.3) : color,
              textColor: isCurrentStatus 
                  ? color 
                  : DriverAppColors.textOnPrimary,
              onPressed: isCurrentStatus 
                  ? null 
                  : () => _handleStatusChange(status),
              icon: _getStatusIcon(status),
            );
          }).toList(),
        ),
      ],
    );
  }

  Color _getStatusColor(DutyStatus status) {
    switch (status) {
      case DutyStatus.driving:
        return DriverAppColors.success;
      case DutyStatus.onDuty:
        return DriverAppColors.info;
      case DutyStatus.sleeperBerth:
        return DriverAppColors.warning;
      case DutyStatus.offDuty:
        return DriverAppColors.textSecondary;
    }
  }

  IconData _getStatusIcon(DutyStatus status) {
    switch (status) {
      case DutyStatus.driving:
        return Icons.drive_eta;
      case DutyStatus.onDuty:
        return Icons.work;
      case DutyStatus.sleeperBerth:
        return Icons.hotel;
      case DutyStatus.offDuty:
        return Icons.power_settings_new;
    }
  }

  String _getStatusText(DutyStatus status) {
    switch (status) {
      case DutyStatus.driving:
        return 'Driving';
      case DutyStatus.onDuty:
        return 'On Duty';
      case DutyStatus.sleeperBerth:
        return 'Sleeper';
      case DutyStatus.offDuty:
        return 'Off Duty';
    }
  }

  Color _getProgressColor(double progress) {
    if (progress > 0.9) return DriverAppColors.error;
    if (progress > 0.75) return DriverAppColors.warning;
    return DriverAppColors.success;
  }

  String _formatTime(DateTime dateTime) {
    return DateFormat('h:mm a').format(dateTime);
  }

  String _getElapsedTime(DateTime startTime) {
    final elapsed = DateTime.now().difference(startTime);
    final hours = elapsed.inHours;
    final minutes = elapsed.inMinutes % 60;
    return '${hours}h ${minutes}m';
  }

  void _handleStatusChange(DutyStatus newStatus) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatusChangeModal(
        newStatus: newStatus,
        onConfirm: (status, location, notes) async {
          try {
            await Provider.of<HoursProvider>(context, listen: false)
                .changeDutyStatus(status, location, notes);
            
            Navigator.pop(context);
            
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Status changed to ${_getStatusText(status)}'),
                backgroundColor: DriverAppColors.success,
              ),
            );
          } catch (e) {
            Navigator.pop(context);
            
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Failed to change status: ${e.toString()}'),
                backgroundColor: DriverAppColors.error,
              ),
            );
          }
        },
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
```

## State Management

### 1. Authentication Provider
```dart
// presentation/providers/auth_provider.dart
class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;
  bool _isInitialized = false;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  bool get isInitialized => _isInitialized;

  final LoginUseCase _loginUseCase;
  final LogoutUseCase _logoutUseCase;
  final CheckAuthStatusUseCase _checkAuthStatusUseCase;

  AuthProvider({
    required LoginUseCase loginUseCase,
    required LogoutUseCase logoutUseCase,
    required CheckAuthStatusUseCase checkAuthStatusUseCase,
  }) : _loginUseCase = loginUseCase,
       _logoutUseCase = logoutUseCase,
       _checkAuthStatusUseCase = checkAuthStatusUseCase;

  Future<void> initialize() async {
    if (_isInitialized) return;
    
    _setLoading(true);
    try {
      final result = await _checkAuthStatusUseCase.execute();
      result.fold(
        (failure) => _setError(failure.message),
        (user) => _setUser(user),
      );
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
      _isInitialized = true;
    }
  }

  Future<void> login(String email, String password, {bool rememberMe = false}) async {
    _setLoading(true);
    _clearError();

    try {
      final result = await _loginUseCase.execute(
        LoginParams(email: email, password: password, rememberMe: rememberMe),
      );
      
      result.fold(
        (failure) => _setError(failure.message),
        (user) => _setUser(user),
      );
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _setLoading(true);
    
    try {
      await _logoutUseCase.execute();
      _clearUser();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshToken() async {
    try {
      final result = await _checkAuthStatusUseCase.execute();
      result.fold(
        (failure) => logout(),
        (user) => _setUser(user),
      );
    } catch (e) {
      await logout();
    }
  }

  void _setUser(User user) {
    _user = user;
    _clearError();
    notifyListeners();
  }

  void _clearUser() {
    _user = null;
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }
}
```

### 2. Driver Provider
```dart
// presentation/providers/driver_provider.dart
class DriverProvider extends ChangeNotifier {
  Driver? _currentDriver;
  Load? _currentLoad;
  List<Load> _availableLoads = [];
  List<Load> _loadHistory = [];
  DriverStatus _status = DriverStatus.offDuty;
  bool _isLoading = false;
  String? _error;

  Driver? get currentDriver => _currentDriver;
  Load? get currentLoad => _currentLoad;
  List<Load> get availableLoads => _availableLoads;
  List<Load> get loadHistory => _loadHistory;
  DriverStatus get currentStatus => _status;
  bool get isLoading => _isLoading;
  String? get error => _error;

  final GetDriverProfileUseCase _getDriverProfileUseCase;
  final UpdateDriverStatusUseCase _updateDriverStatusUseCase;
  final GetAvailableLoadsUseCase _getAvailableLoadsUseCase;
  final AcceptLoadUseCase _acceptLoadUseCase;
  final UpdateLoadStatusUseCase _updateLoadStatusUseCase;

  DriverProvider({
    required GetDriverProfileUseCase getDriverProfileUseCase,
    required UpdateDriverStatusUseCase updateDriverStatusUseCase,
    required GetAvailableLoadsUseCase getAvailableLoadsUseCase,
    required AcceptLoadUseCase acceptLoadUseCase,
    required UpdateLoadStatusUseCase updateLoadStatusUseCase,
  }) : _getDriverProfileUseCase = getDriverProfileUseCase,
       _updateDriverStatusUseCase = updateDriverStatusUseCase,
       _getAvailableLoadsUseCase = getAvailableLoadsUseCase,
       _acceptLoadUseCase = acceptLoadUseCase,
       _updateLoadStatusUseCase = updateLoadStatusUseCase;

  Future<void> loadDriverData() async {
    _setLoading(true);
    _clearError();

    try {
      // Load driver profile
      final driverResult = await _getDriverProfileUseCase.execute();
      driverResult.fold(
        (failure) => _setError(failure.message),
        (driver) {
          _currentDriver = driver;
          _status = driver.status;
        },
      );

      // Load available loads
      await _loadAvailableLoads();
      
      // Load current active load
      await _loadCurrentLoad();

    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> _loadAvailableLoads() async {
    final result = await _getAvailableLoadsUseCase.execute();
    result.fold(
      (failure) => _setError(failure.message),
      (loads) => _availableLoads = loads,
    );
  }

  Future<void> _loadCurrentLoad() async {
    // Find current active load from available loads or separate endpoint
    _currentLoad = _availableLoads.firstWhere(
      (load) => load.status == LoadStatus.assigned || load.status == LoadStatus.inProgress,
      orElse: () => null,
    );
  }

  Future<void> updateStatus(DriverStatus newStatus) async {
    _setLoading(true);
    
    try {
      final result = await _updateDriverStatusUseCase.execute(
        UpdateDriverStatusParams(
          driverId: currentDriver!.id,
          status: newStatus,
          timestamp: DateTime.now(),
        ),
      );
      
      result.fold(
        (failure) => _setError(failure.message),
        (_) {
          _status = newStatus;
          if (_currentDriver != null) {
            _currentDriver = _currentDriver!.copyWith(status: newStatus);
          }
        },
      );
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> acceptLoad(String loadId) async {
    _setLoading(true);
    
    try {
      final result = await _acceptLoadUseCase.execute(AcceptLoadParams(loadId: loadId));
      result.fold(
        (failure) => _setError(failure.message),
        (load) {
          _currentLoad = load;
          _availableLoads.removeWhere((l) => l.id == loadId);
        },
      );
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> updateLoadStatus(String loadId, LoadStatus status) async {
    _setLoading(true);
    
    try {
      final result = await _updateLoadStatusUseCase.execute(
        UpdateLoadStatusParams(loadId: loadId, status: status),
      );
      
      result.fold(
        (failure) => _setError(failure.message),
        (updatedLoad) {
          if (_currentLoad?.id == loadId) {
            _currentLoad = updatedLoad;
          }
          
          // Update in available loads if present
          final index = _availableLoads.indexWhere((l) => l.id == loadId);
          if (index != -1) {
            _availableLoads[index] = updatedLoad;
          }
        },
      );
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshData() async {
    await loadDriverData();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }
}
```

### 3. Hours Provider
```dart
// presentation/providers/hours_provider.dart
class HoursProvider extends ChangeNotifier {
  HoursOfService? _currentStatus;
  List<HoursLog> _hoursHistory = [];
  bool _isLoading = false;
  String? _error;
  Timer? _updateTimer;

  HoursOfService? get currentStatus => _currentStatus;
  List<HoursLog> get hoursHistory => _hoursHistory;
  bool get isLoading => _isLoading;
  String? get error => _error;

  final GetHoursStatusUseCase _getHoursStatusUseCase;
  final UpdateDutyStatusUseCase _updateDutyStatusUseCase;
  final GetHoursHistoryUseCase _getHoursHistoryUseCase;

  HoursProvider({
    required GetHoursStatusUseCase getHoursStatusUseCase,
    required UpdateDutyStatusUseCase updateDutyStatusUseCase,
    required GetHoursHistoryUseCase getHoursHistoryUseCase,
  }) : _getHoursStatusUseCase = getHoursStatusUseCase,
       _updateDutyStatusUseCase = updateDutyStatusUseCase,
       _getHoursHistoryUseCase = getHoursHistoryUseCase {
    _startPeriodicUpdate();
  }

  Future<void> loadHoursData() async {
    _setLoading(true);
    _clearError();

    try {
      // Load current hours status
      final statusResult = await _getHoursStatusUseCase.execute();
      statusResult.fold(
        (failure) => _setError(failure.message),
        (status) => _currentStatus = status,
      );

      // Load hours history
      final historyResult = await _getHoursHistoryUseCase.execute();
      historyResult.fold(
        (failure) => _setError(failure.message),
        (history) => _hoursHistory = history,
      );

    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> changeDutyStatus(
    DutyStatus newStatus,
    String location,
    String? notes,
  ) async {
    _setLoading(true);
    
    try {
      final result = await _updateDutyStatusUseCase.execute(
        UpdateDutyStatusParams(
          status: newStatus,
          location: location,
          notes: notes,
          timestamp: DateTime.now(),
        ),
      );
      
      result.fold(
        (failure) => _setError(failure.message),
        (updatedStatus) {
          _currentStatus = updatedStatus;
          // Add to history
          _hoursHistory.insert(0, HoursLog(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            dutyStatus: newStatus,
            startTime: DateTime.now(),
            location: location,
            notes: notes,
          ));
        },
      );
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  void updateCurrentTime() {
    if (_currentStatus != null) {
      _currentStatus = _currentStatus!.copyWith(
        lastUpdate: DateTime.now(),
      );
      notifyListeners();
    }
  }

  Future<void> refreshData() async {
    await loadHoursData();
  }

  void _startPeriodicUpdate() {
    _updateTimer = Timer.periodic(Duration(minutes: 1), (timer) {
      updateCurrentTime();
    });
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _updateTimer?.cancel();
    super.dispose();
  }
}
```

## Backend Integration

### 1. API Client Implementation
```dart
// core/network/api_client.dart
class ApiClient {
  final Dio _dio;
  final String baseUrl;
  String? _authToken;

  ApiClient({
    required this.baseUrl,
    Dio? dio,
  }) : _dio = dio ?? Dio() {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          // Add auth token if available
          if (_authToken != null) {
            options.headers['Authorization'] = 'Bearer $_authToken';
          }
          
          // Add default headers
          options.headers['Content-Type'] = 'application/json';
          options.headers['Accept'] = 'application/json';
          
          handler.next(options);
        },
        onResponse: (response, handler) {
          handler.next(response);
        },
        onError: (error, handler) {
          _handleError(error);
          handler.next(error);
        },
      ),
    );

    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
      logPrint: (obj) => developer.log(obj.toString(), name: 'ApiClient'),
    ));
  }

  void setAuthToken(String token) {
    _authToken = token;
  }

  void clearAuthToken() {
    _authToken = null;
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get<T>(
        '$baseUrl$path',
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post<T>(
        '$baseUrl$path',
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.put<T>(
        '$baseUrl$path',
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.delete<T>(
        '$baseUrl$path',
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } catch (e) {
      throw _handleDioError(e);
    }
  }

  Exception _handleDioError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return NetworkException('Connection timeout');
        case DioExceptionType.badResponse:
          return ServerException(_getErrorMessage(error.response));
        case DioExceptionType.cancel:
          return NetworkException('Request cancelled');
        case DioExceptionType.connectionError:
          return NetworkException('No internet connection');
        default:
          return NetworkException('Unexpected error occurred');
      }
    }
    return NetworkException('Unexpected error occurred');
  }

  String _getErrorMessage(Response? response) {
    if (response?.data is Map<String, dynamic>) {
      final data = response!.data as Map<String, dynamic>;
      return data['message'] ?? data['error'] ?? 'Server error';
    }
    return 'Server error';
  }

  void _handleError(DioException error) {
    developer.log(
      'API Error: ${error.message}',
      name: 'ApiClient',
      error: error,
    );
  }
}
```

### 2. Remote Data Sources
```dart
// data/datasources/remote/auth_remote_datasource.dart
abstract class AuthRemoteDataSource {
  Future<UserModel> login(String email, String password, bool rememberMe);
  Future<void> logout();
  Future<UserModel> refreshToken();
  Future<UserModel> getCurrentUser();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient apiClient;

  AuthRemoteDataSourceImpl({required this.apiClient});

  @override
  Future<UserModel> login(String email, String password, bool rememberMe) async {
    final response = await apiClient.post('/auth/login', data: {
      'email': email,
      'password': password,
      'rememberMe': rememberMe,
    });

    if (response.statusCode == 200) {
      final data = response.data;
      apiClient.setAuthToken(data['token']);
      return UserModel.fromJson(data['user']);
    } else {
      throw ServerException('Login failed');
    }
  }

  @override
  Future<void> logout() async {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.clearAuthToken();
    }
  }

  @override
  Future<UserModel> refreshToken() async {
    final response = await apiClient.post('/auth/refresh');
    
    if (response.statusCode == 200) {
      final data = response.data;
      apiClient.setAuthToken(data['token']);
      return UserModel.fromJson(data['user']);
    } else {
      throw ServerException('Token refresh failed');
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    final response = await apiClient.get('/auth/me');
    
    if (response.statusCode == 200) {
      return UserModel.fromJson(response.data);
    } else {
      throw ServerException('Failed to get current user');
    }
  }
}
```

### 3. Local Data Sources
```dart
// data/datasources/local/driver_local_datasource.dart
abstract class DriverLocalDataSource {
  Future<DriverModel?> getCachedDriver();
  Future<void> cacheDriver(DriverModel driver);
  Future<void> clearCache();
  Future<List<LoadModel>> getCachedLoads();
  Future<void> cacheLoads(List<LoadModel> loads);
}

class DriverLocalDataSourceImpl implements DriverLocalDataSource {
  final Database database;
  final SharedPreferences sharedPreferences;

  DriverLocalDataSourceImpl({
    required this.database,
    required this.sharedPreferences,
  });

  @override
  Future<DriverModel?> getCachedDriver() async {
    try {
      final List<Map<String, dynamic>> maps = await database.query(
        'drivers',
        limit: 1,
      );

      if (maps.isNotEmpty) {
        return DriverModel.fromJson(maps.first);
      }
      return null;
    } catch (e) {
      throw CacheException('Failed to get cached driver');
    }
  }

  @override
  Future<void> cacheDriver(DriverModel driver) async {
    try {
      await database.insert(
        'drivers',
        driver.toJson(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } catch (e) {
      throw CacheException('Failed to cache driver');
    }
  }

  @override
  Future<void> clearCache() async {
    try {
      await database.delete('drivers');
      await database.delete('loads');
      await database.delete('hours_logs');
    } catch (e) {
      throw CacheException('Failed to clear cache');
    }
  }

  @override
  Future<List<LoadModel>> getCachedLoads() async {
    try {
      final List<Map<String, dynamic>> maps = await database.query('loads');
      return maps.map((map) => LoadModel.fromJson(map)).toList();
    } catch (e) {
      throw CacheException('Failed to get cached loads');
    }
  }

  @override
  Future<void> cacheLoads(List<LoadModel> loads) async {
    try {
      final batch = database.batch();
      
      // Clear existing loads
      batch.delete('loads');
      
      // Insert new loads
      for (final load in loads) {
        batch.insert('loads', load.toJson());
      }
      
      await batch.commit();
    } catch (e) {
      throw CacheException('Failed to cache loads');
    }
  }
}
```

## Advanced Features

### 1. Location Service
```dart
// services/location_service.dart
abstract class LocationService {
  Future<Position> getCurrentLocation();
  Stream<Position> getLocationStream();
  Future<bool> requestPermission();
  Future<String> getAddressFromCoordinates(double latitude, double longitude);
}

class LocationServiceImpl implements LocationService {
  @override
  Future<Position> getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw LocationException('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw LocationException('Location permissions are denied');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw LocationException('Location permissions are permanently denied');
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  @override
  Stream<Position> getLocationStream() {
    return Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // Update every 10 meters
      ),
    );
  }

  @override
  Future<bool> requestPermission() async {
    final permission = await Geolocator.requestPermission();
    return permission == LocationPermission.always ||
           permission == LocationPermission.whileInUse;
  }

  @override
  Future<String> getAddressFromCoordinates(double latitude, double longitude) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(latitude, longitude);
      if (placemarks.isNotEmpty) {
        final place = placemarks.first;
        return '${place.street}, ${place.locality}, ${place.administrativeArea}';
      }
      return 'Unknown location';
    } catch (e) {
      throw LocationException('Failed to get address');
    }
  }
}
```

### 2. Background Service
```dart
// services/background_service.dart
class BackgroundService {
  static const String _trackingTask = 'location_tracking';
  static const String _hoursUpdateTask = 'hours_update';

  static Future<void> initialize() async {
    await Workmanager().initialize(
      callbackDispatcher,
      isInDebugMode: kDebugMode,
    );
  }

  static Future<void> startLocationTracking() async {
    await Workmanager().registerPeriodicTask(
      _trackingTask,
      _trackingTask,
      frequency: Duration(minutes: 15),
      constraints: Constraints(
        networkType: NetworkType.connected,
      ),
    );
  }

  static Future<void> stopLocationTracking() async {
    await Workmanager().cancelByUniqueName(_trackingTask);
  }

  static Future<void> startHoursUpdate() async {
    await Workmanager().registerPeriodicTask(
      _hoursUpdateTask,
      _hoursUpdateTask,
      frequency: Duration(minutes: 30),
    );
  }

  static Future<void> stopHoursUpdate() async {
    await Workmanager().cancelByUniqueName(_hoursUpdateTask);
  }
}

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    switch (task) {
      case 'location_tracking':
        await _handleLocationTracking();
        break;
      case 'hours_update':
        await _handleHoursUpdate();
        break;
      default:
        break;
    }
    return Future.value(true);
  });
}

Future<void> _handleLocationTracking() async {
  try {
    // Get current location
    final position = await Geolocator.getCurrentPosition();
    
    // Send to server
    // Implementation depends on your API setup
    
  } catch (e) {
    print('Background location tracking failed: $e');
  }
}

Future<void> _handleHoursUpdate() async {
  try {
    // Update hours of service calculations
    // Sync with server if needed
    
  } catch (e) {
    print('Background hours update failed: $e');
  }
}
```

### 3. Voice Service
```dart
// services/voice_service.dart
abstract class VoiceService {
  Future<bool> initialize();
  Future<String?> startListening();
  Future<void> stopListening();
  Future<void> speak(String text);
  bool get isListening;
  bool get isAvailable;
}

class VoiceServiceImpl implements VoiceService {
  final SpeechToText _speechToText = SpeechToText();
  final FlutterTts _flutterTts = FlutterTts();
  bool _isListening = false;
  bool _isAvailable = false;

  @override
  bool get isListening => _isListening;
  
  @override
  bool get isAvailable => _isAvailable;

  @override
  Future<bool> initialize() async {
    try {
      _isAvailable = await _speechToText.initialize(
        onError: (error) => print('Speech recognition error: $error'),
        onStatus: (status) => print('Speech recognition status: $status'),
      );

      await _flutterTts.setLanguage('en-US');
      await _flutterTts.setSpeechRate(0.8);
      await _flutterTts.setVolume(0.8);
      await _flutterTts.setPitch(1.0);

      return _isAvailable;
    } catch (e) {
      print('Voice service initialization failed: $e');
      return false;
    }
  }

  @override
  Future<String?> startListening() async {
    if (!_isAvailable) return null;

    final completer = Completer<String?>();
    String recognizedText = '';

    try {
      await _speechToText.listen(
        onResult: (result) {
          recognizedText = result.recognizedWords;
          if (result.finalResult) {
            _isListening = false;
            completer.complete(recognizedText.isNotEmpty ? recognizedText : null);
          }
        },
        listenFor: Duration(seconds: 30),
        pauseFor: Duration(seconds: 3),
        partialResults: true,
      );

      _isListening = true;
      
      // Auto-complete after timeout
      Timer(Duration(seconds: 30), () {
        if (!completer.isCompleted) {
          stopListening();
          completer.complete(recognizedText.isNotEmpty ? recognizedText : null);
        }
      });

      return await completer.future;
    } catch (e) {
      print('Speech recognition failed: $e');
      _isListening = false;
      return null;
    }
  }

  @override
  Future<void> stopListening() async {
    if (_isListening) {
      await _speechToText.stop();
      _isListening = false;
    }
  }

  @override
  Future<void> speak(String text) async {
    try {
      await _flutterTts.speak(text);
    } catch (e) {
      print('Text-to-speech failed: $e');
    }
  }
}
```

## Security & Compliance

### 1. Data Encryption
```dart
// core/security/encryption_service.dart
class EncryptionService {
  static const String _keyAlias = 'freightops_driver_key';
  
  static Future<String> encrypt(String plaintext) async {
    try {
      final key = await _getOrCreateKey();
      final encrypter = Encrypter(AES(key));
      final iv = IV.fromSecureRandom(16);
      final encrypted = encrypter.encrypt(plaintext, iv: iv);
      
      // Combine IV and encrypted data
      final combined = base64.encode(iv.bytes + encrypted.bytes);
      return combined;
    } catch (e) {
      throw SecurityException('Encryption failed');
    }
  }

  static Future<String> decrypt(String encryptedData) async {
    try {
      final key = await _getOrCreateKey();
      final encrypter = Encrypter(AES(key));
      
      // Extract IV and encrypted data
      final combined = base64.decode(encryptedData);
      final iv = IV(combined.sublist(0, 16));
      final encrypted = Encrypted(combined.sublist(16));
      
      final decrypted = encrypter.decrypt(encrypted, iv: iv);
      return decrypted;
    } catch (e) {
      throw SecurityException('Decryption failed');
    }
  }

  static Future<Key> _getOrCreateKey() async {
    final prefs = await SharedPreferences.getInstance();
    String? keyString = prefs.getString(_keyAlias);
    
    if (keyString == null) {
      final key = Key.fromSecureRandom(32);
      keyString = base64.encode(key.bytes);
      await prefs.setString(_keyAlias, keyString);
      return key;
    }
    
    return Key(base64.decode(keyString));
  }
}
```

### 2. DOT Compliance Validator
```dart
// core/compliance/dot_compliance_validator.dart
class DOTComplianceValidator {
  static List<ComplianceViolation> validateHoursOfService(HoursOfService hours) {
    final violations = <ComplianceViolation>[];

    // 11-Hour Driving Limit
    if (hours.drivingTime.inHours > 11) {
      violations.add(ComplianceViolation(
        type: ViolationType.drivingLimit,
        severity: ViolationSeverity.critical,
        message: 'Exceeded 11-hour driving limit',
        regulationRef: '49 CFR 395.8(a)',
      ));
    }

    // 14-Hour Duty Limit
    if (hours.onDutyTime.inHours > 14) {
      violations.add(ComplianceViolation(
        type: ViolationType.dutyLimit,
        severity: ViolationSeverity.critical,
        message: 'Exceeded 14-hour duty limit',
        regulationRef: '49 CFR 395.8(a)',
      ));
    }

    // 60/70-Hour Limit (weekly)
    final weeklyLimit = hours.is70HourRule ? 70 : 60;
    if (hours.weeklyHours.inHours > weeklyLimit) {
      violations.add(ComplianceViolation(
        type: ViolationType.weeklyLimit,
        severity: ViolationSeverity.critical,
        message: 'Exceeded $weeklyLimit-hour weekly limit',
        regulationRef: '49 CFR 395.8(a)',
      ));
    }

    // 30-Minute Break Rule
    if (hours.timeSinceLastBreak.inMinutes > 480) { // 8 hours
      violations.add(ComplianceViolation(
        type: ViolationType.breakRequired,
        severity: ViolationSeverity.warning,
        message: '30-minute break required',
        regulationRef: '49 CFR 395.8(e)',
      ));
    }

    // 10-Hour Off-Duty Requirement
    if (hours.consecutiveOffDutyTime.inHours < 10 && hours.drivingTime.inMinutes > 0) {
      violations.add(ComplianceViolation(
        type: ViolationType.restPeriod,
        severity: ViolationSeverity.critical,
        message: 'Insufficient off-duty time',
        regulationRef: '49 CFR 395.8(a)',
      ));
    }

    return violations;
  }

  static bool isDriverEligibleToDrive(HoursOfService hours) {
    final violations = validateHoursOfService(hours);
    return !violations.any((v) => v.severity == ViolationSeverity.critical);
  }

  static Duration getRequiredRestTime(HoursOfService hours) {
    final violations = validateHoursOfService(hours);
    
    // Find the most restrictive rest requirement
    Duration maxRest = Duration.zero;
    
    for (final violation in violations) {
      switch (violation.type) {
        case ViolationType.drivingLimit:
        case ViolationType.dutyLimit:
          maxRest = Duration(hours: 10);
          break;
        case ViolationType.weeklyLimit:
          maxRest = Duration(hours: 34); // 34-hour restart
          break;
        case ViolationType.restPeriod:
          final remaining = Duration(hours: 10) - hours.consecutiveOffDutyTime;
          if (remaining > maxRest) maxRest = remaining;
          break;
        default:
          break;
      }
    }
    
    return maxRest;
  }
}
```

## Testing & Deployment

### 1. Unit Tests Example
```dart
// test/providers/auth_provider_test.dart
void main() {
  group('AuthProvider Tests', () {
    late AuthProvider authProvider;
    late MockLoginUseCase mockLoginUseCase;
    late MockLogoutUseCase mockLogoutUseCase;
    late MockCheckAuthStatusUseCase mockCheckAuthStatusUseCase;

    setUp(() {
      mockLoginUseCase = MockLoginUseCase();
      mockLogoutUseCase = MockLogoutUseCase();
      mockCheckAuthStatusUseCase = MockCheckAuthStatusUseCase();
      
      authProvider = AuthProvider(
        loginUseCase: mockLoginUseCase,
        logoutUseCase: mockLogoutUseCase,
        checkAuthStatusUseCase: mockCheckAuthStatusUseCase,
      );
    });

    test('should login successfully with valid credentials', () async {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      final user = User(id: '1', email: email, firstName: 'Test', lastName: 'User');
      
      when(mockLoginUseCase.execute(any))
          .thenAnswer((_) async => Right(user));

      // Act
      await authProvider.login(email, password);

      // Assert
      expect(authProvider.isAuthenticated, true);
      expect(authProvider.user, user);
      expect(authProvider.error, null);
    });

    test('should handle login failure', () async {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      
      when(mockLoginUseCase.execute(any))
          .thenAnswer((_) async => Left(AuthFailure('Invalid credentials')));

      // Act
      await authProvider.login(email, password);

      // Assert
      expect(authProvider.isAuthenticated, false);
      expect(authProvider.user, null);
      expect(authProvider.error, 'Invalid credentials');
    });
  });
}
```

### 2. Integration Tests
```dart
// integration_test/app_test.dart
void main() {
  group('FreightOps Driver App Integration Tests', () {
    testWidgets('complete login flow', (WidgetTester tester) async {
      // Start the app
      app.main();
      await tester.pumpAndSettle();

      // Find login fields
      final emailField = find.byKey(Key('email_field'));
      final passwordField = find.byKey(Key('password_field'));
      final loginButton = find.byKey(Key('login_button'));

      // Enter credentials
      await tester.enterText(emailField, 'test@example.com');
      await tester.enterText(passwordField, 'password123');
      
      // Tap login button
      await tester.tap(loginButton);
      await tester.pumpAndSettle();

      // Verify navigation to dashboard
      expect(find.byKey(Key('dashboard_screen')), findsOneWidget);
    });

    testWidgets('hours of service status change', (WidgetTester tester) async {
      // Login first
      await _loginUser(tester);

      // Navigate to hours tab
      await tester.tap(find.byKey(Key('hours_tab')));
      await tester.pumpAndSettle();

      // Find status change button
      final onDutyButton = find.byKey(Key('on_duty_button'));
      await tester.tap(onDutyButton);
      await tester.pumpAndSettle();

      // Verify status change modal
      expect(find.byKey(Key('status_change_modal')), findsOneWidget);
      
      // Confirm status change
      await tester.tap(find.byKey(Key('confirm_status_change')));
      await tester.pumpAndSettle();

      // Verify status updated
      expect(find.text('On Duty'), findsOneWidget);
    });
  });
}

Future<void> _loginUser(WidgetTester tester) async {
  await tester.enterText(find.byKey(Key('email_field')), 'test@example.com');
  await tester.enterText(find.byKey(Key('password_field')), 'password123');
  await tester.tap(find.byKey(Key('login_button')));
  await tester.pumpAndSettle();
}
```

### 3. Build Configuration
```yaml
# android/app/build.gradle additions
android {
    ...
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            useProguard true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
          
      - name: Get dependencies
        run: flutter pub get
        
      - name: Run analyzer
        run: flutter analyze
        
      - name: Run unit tests
        run: flutter test --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target: [android, ios]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
          
      - name: Build APK
        if: matrix.target == 'android'
        run: flutter build apk --release
        
      - name: Build iOS
        if: matrix.target == 'ios'
        run: flutter build ios --release --no-codesign
```

## Final Implementation Notes

### Performance Optimization
- Implement lazy loading for large datasets
- Use `const` constructors where possible
- Optimize image loading with `cached_network_image`
- Implement proper memory management for location tracking
- Use `RepaintBoundary` for expensive widgets

### Accessibility Features
- Semantic labels for all interactive elements
- Support for screen readers
- High contrast mode support
- Large text support
- Voice navigation capabilities

### Platform-Specific Considerations
- iOS: Configure Info.plist for location and camera permissions
- Android: Configure AndroidManifest.xml for required permissions
- Handle platform-specific UI differences
- Implement proper app lifecycle management

This comprehensive guide provides everything needed to build a production-ready FreightOps Pro driver mobile application with Flutter, following industry best practices for safety, compliance, and user experience.
```

### 2. Dashboard Screen (`screens/dashboard/dashboard_screen.dart`)

#### Layout Structure
The dashboard uses a tab-based navigation with 5 main sections:
1. **Overview** - Current status, hours, active load
2. **Hours** - Hours of Service tracking and logs
3. **Loads** - Available and assigned loads
4. **Inspection** - DVIR and inspection reports
5. **Profile** - Driver information and settings

```dart
class DashboardScreen extends StatefulWidget {
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  
  final List<Widget> _screens = [
    OverviewTab(),
    HoursTab(),
    LoadsTab(),
    InspectionTab(),
    ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: DriverBottomNavigation(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
```

#### Overview Tab (`screens/dashboard/overview_tab.dart`)
```dart
class OverviewTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<DriverProvider>(
      builder: (context, driverProvider, child) {
        final driver = driverProvider.currentDriver;
        final currentLoad = driverProvider.currentLoad;
        final hoursStatus = driverProvider.hoursStatus;
        
        return Scaffold(
          backgroundColor: Color(0xFFF8FAFC),
          appBar: DriverAppBar(
            title: 'Overview',
            actions: [
              IconButton(
                icon: Icon(Icons.notifications),
                onPressed: () => Navigator.pushNamed(context, '/notifications'),
              ),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () => driverProvider.refreshData(),
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Driver status card
                  DriverStatusCard(
                    driver: driver,
                    status: driverProvider.currentStatus,
                  ),
                  
                  SizedBox(height: 16),
                  
                  // Hours of service summary
                  HoursOfServiceCard(
                    hoursStatus: hoursStatus,
                    onTap: () => _navigateToHours(context),
                  ),
                  
                  SizedBox(height: 16),
                  
                  // Current load card
                  if (currentLoad != null)
                    CurrentLoadCard(
                      load: currentLoad,
                      onTap: () => _navigateToLoadDetail(context, currentLoad),
                    ),
                  
                  SizedBox(height: 16),
                  
                  // Quick actions
                  QuickActionsGrid(),
                  
                  SizedBox(height: 16),
                  
                  // Recent activity
                  RecentActivityCard(),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
```

**UX Design Notes:**
- Card-based layout for easy scanning of information
- Pull-to-refresh functionality for real-time updates
- Quick actions for common driver tasks
- Color-coded status indicators for immediate recognition
- Large touch targets for safe operation while in vehicle

### 3. Hours of Service Screen (`screens/hours/hours_screen.dart`)

#### HOS Dashboard
```dart
class HoursScreen extends StatefulWidget {
  @override
  State<HoursScreen> createState() => _HoursScreenState();
}

class _HoursScreenState extends State<HoursScreen> with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: DriverAppBar(
        title: 'Hours of Service',
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'Current'),
            Tab(text: 'Logs'),
            Tab(text: 'Clock'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          HoursCurrentTab(),
          HoursLogsTab(),
          HoursClockTab(),
        ],
      ),
    );
  }
}
```

#### Hours Current Tab - Real-time HOS tracking
```dart
class HoursCurrentTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<HoursProvider>(
      builder: (context, hoursProvider, child) {
        final currentStatus = hoursProvider.currentStatus;
        
        return Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            children: [
              // Current duty status
              DutyStatusCard(
                currentStatus: currentStatus.dutyStatus,
                startTime: currentStatus.startTime,
                elapsed: currentStatus.elapsed,
              ),
              
              SizedBox(height: 16),
              
              // Hours breakdown
              HoursBreakdownCard(
                driving: currentStatus.drivingHours,
                onDuty: currentStatus.onDutyHours,
                sleeper: currentStatus.sleeperHours,
                offDuty: currentStatus.offDutyHours,
              ),
              
              SizedBox(height: 16),
              
              // Remaining hours
              RemainingHoursCard(
                driveTime: currentStatus.remainingDriveTime,
                shiftTime: currentStatus.remainingShiftTime,
                cycleTime: currentStatus.remainingCycleTime,
              ),
              
              SizedBox(height: 24),
              
              // Status change buttons
              HoursStatusButtons(
                currentStatus: currentStatus.dutyStatus,
                onStatusChange: (newStatus) {
                  _showStatusChangeDialog(context, newStatus);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _showStatusChangeDialog(BuildContext context, DutyStatus newStatus) {
    showDialog(
      context: context,
      builder: (context) => HoursStatusChangeDialog(
        newStatus: newStatus,
        onConfirm: (status, location, notes) {
          Provider.of<HoursProvider>(context, listen: false)
              .changeDutyStatus(status, location, notes);
        },
      ),
    );
  }
}
```

**UX Design Notes:**
- Large, color-coded status buttons for easy identification
- Real-time countdown timers for remaining hours
- Clear visual indicators for DOT compliance status
- Voice annotations for hands-free operation
- GPS auto-location with manual override option

### 4. Loads Screen (`screens/loads/loads_screen.dart`)

#### Load Management Interface
```dart
class LoadsScreen extends StatefulWidget {
  @override
  State<LoadsScreen> createState() => _LoadsScreenState();
}

class _LoadsScreenState extends State<LoadsScreen> with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: DriverAppBar(
        title: 'Loads',
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'Active'),
            Tab(text: 'Available'),
            Tab(text: 'History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          ActiveLoadsTab(),
          AvailableLoadsTab(),
          LoadHistoryTab(),
        ],
      ),
    );
  }
}
```

#### Active Load Detail Screen
```dart
class LoadDetailScreen extends StatelessWidget {
  final Load load;

  const LoadDetailScreen({required this.load});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: DriverAppBar(
        title: 'Load ${load.loadNumber}',
        actions: [
          IconButton(
            icon: Icon(Icons.call),
            onPressed: () => _callDispatch(context),
          ),
          IconButton(
            icon: Icon(Icons.navigation),
            onPressed: () => _openNavigation(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Load status indicator
            LoadStatusIndicator(status: load.status),
            
            SizedBox(height: 16),
            
            // Pickup information
            LocationCard(
              title: 'Pickup',
              location: load.pickupLocation,
              contact: load.pickupContact,
              dateTime: load.pickupDateTime,
              isCompleted: load.pickupCompleted,
              onAction: () => _handlePickupAction(context),
            ),
            
            SizedBox(height: 16),
            
            // Delivery information
            LocationCard(
              title: 'Delivery',
              location: load.deliveryLocation,
              contact: load.deliveryContact,
              dateTime: load.deliveryDateTime,
              isCompleted: load.deliveryCompleted,
              onAction: () => _handleDeliveryAction(context),
            ),
            
            SizedBox(height: 16),
            
            // Load details
            LoadDetailsCard(load: load),
            
            SizedBox(height: 16),
            
            // Documents
            DocumentsCard(
              documents: load.documents,
              onUpload: () => _uploadDocument(context),
            ),
            
            SizedBox(height: 16),
            
            // Messages/Notes
            MessagesCard(
              messages: load.messages,
              onSendMessage: () => _sendMessage(context),
            ),
          ],
        ),
      ),
    );
  }
}
```

**UX Design Notes:**
- Clear progression indicators for load status
- One-tap calling and navigation integration
- Photo capture for documents and proof of delivery
- Real-time messaging with dispatch
- GPS tracking with automatic status updates

### 5. Inspection Screen (`screens/inspection/inspection_screen.dart`)

#### DVIR (Driver Vehicle Inspection Report)
```dart
class InspectionScreen extends StatefulWidget {
  @override
  State<InspectionScreen> createState() => _InspectionScreenState();
}

class _InspectionScreenState extends State<InspectionScreen> {
  final _formKey = GlobalKey<FormState>();
  InspectionType _inspectionType = InspectionType.preTrip;
  List<InspectionItem> _inspectionItems = [];
  bool _hasDefects = false;

  @override
  void initState() {
    super.initState();
    _loadInspectionItems();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: DriverAppBar(
        title: 'Vehicle Inspection',
        actions: [
          IconButton(
            icon: Icon(Icons.history),
            onPressed: () => Navigator.pushNamed(context, '/inspection-history'),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            // Inspection type selector
            InspectionTypeSelector(
              type: _inspectionType,
              onChanged: (type) {
                setState(() {
                  _inspectionType = type;
                });
                _loadInspectionItems();
              },
            ),
            
            Expanded(
              child: ListView.builder(
                padding: EdgeInsets.all(16),
                itemCount: _inspectionItems.length,
                itemBuilder: (context, index) {
                  return InspectionItemCard(
                    item: _inspectionItems[index],
                    onStatusChange: (status) {
                      setState(() {
                        _inspectionItems[index].status = status;
                        _updateDefectsStatus();
                      });
                    },
                    onAddNote: (note) {
                      setState(() {
                        _inspectionItems[index].notes = note;
                      });
                    },
                    onAddPhoto: (photo) {
                      setState(() {
                        _inspectionItems[index].photos.add(photo);
                      });
                    },
                  );
                },
              ),
            ),
            
            // Submit button
            Padding(
              padding: EdgeInsets.all(16),
              child: DriverPrimaryButton(
                text: _hasDefects ? 'Submit with Defects' : 'Submit Inspection',
                backgroundColor: _hasDefects ? Color(0xFFEF4444) : null,
                onPressed: _submitInspection,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _submitInspection() async {
    if (_formKey.currentState?.validate() ?? false) {
      try {
        final inspectionProvider = Provider.of<InspectionProvider>(context, listen: false);
        await inspectionProvider.submitInspection(
          type: _inspectionType,
          items: _inspectionItems,
          hasDefects: _hasDefects,
        );
        
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Inspection submitted successfully')),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit inspection: ${e.toString()}')),
        );
      }
    }
  }
}
```

**UX Design Notes:**
- Checklist-style interface for systematic inspection
- Photo capture for defects and issues
- Voice notes for detailed descriptions
- Digital signature capture for compliance
- Offline capability with sync when connected

## Core Components Library

### 1. Navigation Components

#### DriverBottomNavigation
```dart
class DriverBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const DriverBottomNavigation({
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: currentIndex,
      onTap: onTap,
      selectedItemColor: Color(0xFF2563EB),
      unselectedItemColor: Color(0xFF6B7280),
      backgroundColor: Colors.white,
      elevation: 8,
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.dashboard),
          label: 'Overview',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.access_time),
          label: 'Hours',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.local_shipping),
          label: 'Loads',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.assignment),
          label: 'Inspection',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Profile',
        ),
      ],
    );
  }
}
```

#### DriverAppBar
```dart
class DriverAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final PreferredSizeWidget? bottom;
  final bool showBack;

  const DriverAppBar({
    required this.title,
    this.actions,
    this.bottom,
    this.showBack = true,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
      backgroundColor: Color(0xFF2563EB),
      foregroundColor: Colors.white,
      elevation: 0,
      actions: actions,
      bottom: bottom,
      automaticallyImplyLeading: showBack,
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(
    kToolbarHeight + (bottom?.preferredSize.height ?? 0),
  );
}
```

### 2. Form Components

#### DriverInputField
```dart
class DriverInputField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final IconData? prefixIcon;
  final bool obscureText;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final VoidCallback? onTap;
  final bool readOnly;

  const DriverInputField({
    required this.controller,
    required this.label,
    this.hint,
    this.prefixIcon,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.onTap,
    this.readOnly = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: Color(0xFF1F2937),
          ),
        ),
        SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          validator: validator,
          onTap: onTap,
          readOnly: readOnly,
          style: TextStyle(fontSize: 16),
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: prefixIcon != null ? Icon(prefixIcon) : null,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Color(0xFFD1D5DB)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Color(0xFF2563EB), width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Color(0xFFEF4444), width: 2),
            ),
            filled: true,
            fillColor: Colors.white,
            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          ),
        ),
      ],
    );
  }
}
```

#### DriverPrimaryButton
```dart
class DriverPrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final Color? backgroundColor;
  final Color? textColor;
  final double height;

  const DriverPrimaryButton({
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.backgroundColor,
    this.textColor,
    this.height = 56,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor ?? Color(0xFF2563EB),
          foregroundColor: textColor ?? Colors.white,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        child: isLoading
            ? SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    textColor ?? Colors.white,
                  ),
                ),
              )
            : Text(text),
      ),
    );
  }
}
```

### 3. Card Components

#### DriverStatusCard
```dart
class DriverStatusCard extends StatelessWidget {
  final Driver driver;
  final DriverStatus status;

  const DriverStatusCard({
    required this.driver,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: Color(0xFF2563EB),
                  child: Text(
                    driver.firstName[0] + driver.lastName[0],
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${driver.firstName} ${driver.lastName}',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Driver #${driver.driverNumber}',
                        style: TextStyle(
                          color: Color(0xFF6B7280),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                StatusIndicator(status: status),
              ],
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildInfoItem(
                    'Current Status',
                    status.displayName,
                    status.color,
                  ),
                ),
                Expanded(
                  child: _buildInfoItem(
                    'Location',
                    driver.currentLocation ?? 'Unknown',
                    Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoItem(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Color(0xFF6B7280),
            fontWeight: FontWeight.w500,
          ),
        ),
        SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            color: color,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
```

#### HoursOfServiceCard
```dart
class HoursOfServiceCard extends StatelessWidget {
  final HoursStatus hoursStatus;
  final VoidCallback onTap;

  const HoursOfServiceCard({
    required this.hoursStatus,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.access_time,
                    color: Color(0xFF2563EB),
                    size: 24,
                  ),
                  SizedBox(width: 12),
                  Text(
                    'Hours of Service',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Spacer(),
                  Icon(
                    Icons.arrow_forward_ios,
                    color: Color(0xFF6B7280),
                    size: 16,
                  ),
                ],
              ),
              SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildHoursItem(
                      'Drive Time',
                      hoursStatus.remainingDriveTime,
                      _getTimeColor(hoursStatus.remainingDriveTime),
                    ),
                  ),
                  Expanded(
                    child: _buildHoursItem(
                      'On Duty',
                      hoursStatus.remainingShiftTime,
                      _getTimeColor(hoursStatus.remainingShiftTime),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12),
              _buildProgressBar(
                'Daily Progress',
                hoursStatus.dailyProgress,
                Color(0xFF2563EB),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHoursItem(String label, Duration remaining, Color color) {
    final hours = remaining.inHours;
    final minutes = remaining.inMinutes % 60;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Color(0xFF6B7280),
            fontWeight: FontWeight.w500,
          ),
        ),
        SizedBox(height: 4),
        Text(
          '${hours}h ${minutes}m',
          style: TextStyle(
            fontSize: 16,
            color: color,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildProgressBar(String label, double progress, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Color(0xFF6B7280),
            fontWeight: FontWeight.w500,
          ),
        ),
        SizedBox(height: 8),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: Color(0xFFE5E7EB),
          valueColor: AlwaysStoppedAnimation<Color>(color),
          minHeight: 8,
        ),
      ],
    );
  }

  Color _getTimeColor(Duration remaining) {
    if (remaining.inMinutes < 60) return Color(0xFFEF4444);
    if (remaining.inMinutes < 120) return Color(0xFFF59E0B);
    return Color(0xFF10B981);
  }
}
```

## State Management Architecture

### AuthProvider
```dart
class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  Future<void> login(String email, String password, {bool rememberMe = false}) async {
    _setLoading(true);
    _error = null;

    try {
      final response = await ApiService.login(email, password);
      _user = User.fromJson(response.data);
      
      if (rememberMe) {
        await _saveCredentials(email, password);
      }
      
      await DatabaseService.saveUser(_user!);
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      throw e;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _user = null;
    await DatabaseService.clearUser();
    await _clearCredentials();
    notifyListeners();
  }

  Future<void> checkAuthStatus() async {
    _setLoading(true);
    
    try {
      final savedUser = await DatabaseService.getUser();
      if (savedUser != null) {
        _user = savedUser;
        // Verify with server
        await ApiService.verifyToken();
      }
    } catch (e) {
      await logout();
    } finally {
      _setLoading(false);
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
}
```

### DriverProvider
```dart
class DriverProvider extends ChangeNotifier {
  Driver? _currentDriver;
  Load? _currentLoad;
  List<Load> _availableLoads = [];
  DriverStatus _status = DriverStatus.offDuty;
  HoursStatus? _hoursStatus;

  Driver? get currentDriver => _currentDriver;
  Load? get currentLoad => _currentLoad;
  List<Load> get availableLoads => _availableLoads;
  DriverStatus get currentStatus => _status;
  HoursStatus? get hoursStatus => _hoursStatus;

  Future<void> loadDriverData() async {
    try {
      final driver = await ApiService.getCurrentDriver();
      _currentDriver = driver;
      
      final loads = await ApiService.getDriverLoads(driver.id);
      _availableLoads = loads.where((l) => l.status == 'available').toList();
      _currentLoad = loads.firstWhere(
        (l) => l.status == 'assigned' || l.status == 'in_progress',
        orElse: () => null,
      );
      
      final hours = await ApiService.getHoursStatus(driver.id);
      _hoursStatus = hours;
      
      notifyListeners();
    } catch (e) {
      throw e;
    }
  }

  Future<void> updateStatus(DriverStatus newStatus) async {
    try {
      await ApiService.updateDriverStatus(currentDriver!.id, newStatus);
      _status = newStatus;
      notifyListeners();
    } catch (e) {
      throw e;
    }
  }

  Future<void> acceptLoad(String loadId) async {
    try {
      await ApiService.acceptLoad(loadId);
      await loadDriverData(); // Refresh data
    } catch (e) {
      throw e;
    }
  }

  Future<void> refreshData() async {
    await loadDriverData();
  }
}
```

## Backend Integration

### API Service
```dart
class ApiService {
  static const String baseUrl = 'https://your-api-domain.com/api';
  static String? _authToken;

  static Future<ApiResponse> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      _authToken = data['token'];
      return ApiResponse.fromJson(data);
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }

  static Future<Driver> getCurrentDriver() async {
    final response = await _authenticatedRequest('GET', '/driver/profile');
    return Driver.fromJson(response.data);
  }

  static Future<List<Load>> getDriverLoads(String driverId) async {
    final response = await _authenticatedRequest('GET', '/driver/$driverId/loads');
    return (response.data as List).map((e) => Load.fromJson(e)).toList();
  }

  static Future<HoursStatus> getHoursStatus(String driverId) async {
    final response = await _authenticatedRequest('GET', '/driver/$driverId/hours');
    return HoursStatus.fromJson(response.data);
  }

  static Future<ApiResponse> updateDriverStatus(String driverId, DriverStatus status) async {
    return await _authenticatedRequest('POST', '/driver/$driverId/status', {
      'status': status.toString(),
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  static Future<ApiResponse> _authenticatedRequest(
    String method,
    String endpoint, [
    Map<String, dynamic>? body,
  ]) async {
    final headers = {
      'Content-Type': 'application/json',
      if (_authToken != null) 'Authorization': 'Bearer $_authToken',
    };

    final uri = Uri.parse('$baseUrl$endpoint');
    http.Response response;

    switch (method) {
      case 'GET':
        response = await http.get(uri, headers: headers);
        break;
      case 'POST':
        response = await http.post(
          uri,
          headers: headers,
          body: body != null ? json.encode(body) : null,
        );
        break;
      case 'PUT':
        response = await http.put(
          uri,
          headers: headers,
          body: body != null ? json.encode(body) : null,
        );
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: headers);
        break;
      default:
        throw Exception('Unsupported HTTP method: $method');
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return ApiResponse.fromJson(json.decode(response.body));
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }
}
```

## Advanced Features

### 1. Offline Capability
- SQLite local database for core data
- Background sync when connectivity restored
- Offline form submission queue
- Critical function availability without internet

### 2. Real-time Location Tracking
- GPS background service
- Geofencing for pickup/delivery locations
- Route optimization integration
- Location sharing with dispatch

### 3. Voice Integration
- Voice commands for hands-free operation
- Audio notifications for critical alerts
- Voice notes for inspections and logs
- Text-to-speech for load information

### 4. Push Notifications
- Load assignments and updates
- HOS compliance alerts
- Dispatch messages
- Emergency notifications

### 5. Camera Integration
- Document scanning and upload
- Proof of delivery photos
- Inspection damage documentation
- QR code scanning for loads

## Security & Compliance

### Data Protection
- End-to-end encryption for sensitive data
- Secure token-based authentication
- Local data encryption at rest
- Automatic session timeout

### DOT Compliance
- FMCSA Hours of Service rules
- Electronic Logging Device (ELD) integration
- Automatic violation detection
- Compliance reporting

### Privacy
- Location data anonymization
- User consent management
- Data retention policies
- GDPR compliance features

## Testing Strategy

### Unit Tests
- API service methods
- Data model validation
- State management logic
- Utility functions

### Integration Tests
- Authentication flow
- Data synchronization
- Camera functionality
- Location services

### UI Tests
- Critical user journeys
- Form validation
- Navigation flows
- Accessibility compliance

## Deployment

### App Store Requirements
- iOS App Store guidelines compliance
- Google Play Store requirements
- Privacy policy and terms of service
- Age rating and content warnings

### Build Configuration
```yaml
# pubspec.yaml version configuration
version: 1.0.0+1

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/
  fonts:
    - family: Inter
      fonts:
        - asset: fonts/Inter-Regular.ttf
        - asset: fonts/Inter-Medium.ttf
          weight: 500
        - asset: fonts/Inter-SemiBold.ttf
          weight: 600
        - asset: fonts/Inter-Bold.ttf
          weight: 700
```

### Performance Optimization
- Image optimization and caching
- Lazy loading for large lists
- Background task optimization
- Memory management for location tracking
- Battery usage optimization

This comprehensive Flutter guide provides everything needed to build a professional, DOT-compliant driver mobile app that integrates seamlessly with the FreightOps Pro platform while maintaining the highest standards of safety, usability, and compliance.