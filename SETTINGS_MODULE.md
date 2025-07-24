# FreightOps Pro - Settings Module Documentation

## Overview

The Settings Module provides comprehensive configuration management for FreightOps Pro, including company profiles, user management, integrations, notifications, security settings, and subscription management. It serves as the central hub for all platform customization and administrative functions.

## Core Features

### Company Profile Management
- **Company Information**: DOT/MC numbers, FMCSA verification, business details
- **Contact Information**: Primary contacts, billing addresses, communication preferences
- **Business Configuration**: Operating authorities, service areas, equipment types
- **Compliance Settings**: Safety ratings, insurance information, regulatory compliance

### User Management & Access Control
- **Role-Based Access**: Admin, user, dispatcher, driver role management
- **Permission Settings**: Granular access control for modules and features
- **User Profiles**: Personal information, contact details, authentication settings
- **Team Management**: Department organization and reporting structures

### Integration Management
- **ELD Systems**: Electronic logging device integrations and configurations
- **Load Boards**: DAT, Truckstop, 123Loadboard connections
- **Port Integration**: Container tracking and vessel schedule access
- **API Services**: Third-party service connections and webhooks

### Subscription & Billing
- **Plan Management**: Subscription tier upgrades, downgrades, and changes
- **Add-on Services**: Container tracking, advanced analytics feature management
- **Billing Information**: Payment methods, billing addresses, invoice preferences
- **Usage Tracking**: Feature utilization and billing cycle management

### Security & Compliance
- **Authentication Settings**: Password policies, two-factor authentication
- **Data Protection**: Privacy settings, data retention policies
- **Audit Logging**: User activity tracking and compliance reporting
- **Security Monitoring**: Login attempts, suspicious activity alerts

## Settings Categories

### 1. General Settings
```
- Company Profile
- Business Information
- Contact Details
- Operating Authorities
- Service Areas
```

### 2. User Management
```
- User Accounts
- Role Assignments
- Permission Matrix
- Access Control
- Team Structure
```

### 3. Integrations
```
ELD Systems:
- Garmin eLog
- KeepTruckin
- Samsara
- Omnitracs

Load Boards:
- DAT Power
- Truckstop.com
- 123Loadboard
- Direct Freight

Port Integration:
- West Coast Ports (LA/Long Beach, Oakland, Seattle/Tacoma)
- East Coast Ports (New York/New Jersey, Savannah, Charleston)
- Gulf Coast Ports (Houston, New Orleans, Mobile)

API Services:
- Webhook configurations
- API key management
- Rate limits
- Error handling
```

### 4. Notifications
```
- Email preferences
- SMS alerts
- Push notifications
- Escalation rules
- Communication templates
```

### 5. Billing & Subscription
```
- Current plan details
- Usage metrics
- Billing history
- Payment methods
- Invoice preferences
```

### 6. Security
```
- Password policies
- Two-factor authentication
- Session management
- Access logs
- Security alerts
```

### 7. System Preferences
```
- Time zone settings
- Date/time formats
- Language preferences
- Default views
- Dashboard layouts
```

## API Endpoints

### Company Settings
```
GET /api/settings/company - Get company profile
PUT /api/settings/company - Update company information
GET /api/settings/fmcsa/verify - Verify DOT/MC numbers
```

### User Management
```
GET /api/settings/users - List company users
POST /api/settings/users - Create new user
PUT /api/settings/users/:id - Update user details
DELETE /api/settings/users/:id - Remove user
PUT /api/settings/users/:id/role - Update user role
```

### Integrations
```
GET /api/settings/integrations - List all integrations
POST /api/settings/integrations/eld - Configure ELD system
POST /api/settings/integrations/loadboard - Setup load board connection
PUT /api/settings/integrations/:id - Update integration settings
DELETE /api/settings/integrations/:id - Remove integration
```

### Subscription Management
```
GET /api/settings/subscription - Get current subscription
PUT /api/settings/subscription/plan - Change subscription plan
POST /api/settings/subscription/addons - Add subscription features
GET /api/settings/billing/history - Get billing history
PUT /api/settings/billing/payment - Update payment method
```

### Security Settings
```
GET /api/settings/security - Get security configuration
PUT /api/settings/security/password-policy - Update password requirements
POST /api/settings/security/2fa - Enable two-factor authentication
GET /api/settings/security/audit-log - Get security audit log
```

## Database Schema

### Company Settings
```sql
company_settings (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  setting_category VARCHAR NOT NULL,
  setting_key VARCHAR NOT NULL,
  setting_value JSONB,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### User Roles & Permissions
```sql
user_roles (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  role_name VARCHAR NOT NULL,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

user_permissions (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  company_id UUID NOT NULL,
  role_id UUID REFERENCES user_roles(id),
  custom_permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Integration Configurations
```sql
integration_configs (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  integration_type VARCHAR NOT NULL,
  provider_name VARCHAR NOT NULL,
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Subscription Management
```sql
company_subscriptions (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  plan_name VARCHAR NOT NULL,
  plan_tier VARCHAR NOT NULL,
  billing_cycle VARCHAR DEFAULT 'monthly',
  monthly_price DECIMAL(8,2),
  add_ons JSONB DEFAULT '[]',
  status VARCHAR DEFAULT 'active',
  current_period_start DATE,
  current_period_end DATE,
  stripe_subscription_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## Frontend Components

### Settings Navigation
- **Tabbed Interface**: Clean organization of settings categories
- **Search Functionality**: Quick access to specific settings
- **Breadcrumb Navigation**: Clear location tracking within settings
- **Save/Cancel Actions**: Consistent form handling across all settings

### Company Profile
- **FMCSA Integration**: Real-time DOT/MC verification
- **Business Information Forms**: Comprehensive company data management
- **Document Upload**: Business licenses, insurance certificates
- **Contact Management**: Multiple contact types and preferences

### User Management Interface
- **User Grid**: Sortable and filterable user listing
- **Role Assignment**: Visual role selection and permission matrix
- **Bulk Actions**: Mass user operations and imports
- **Activity Monitoring**: User login and activity tracking

### Integration Dashboard
- **Connection Status**: Visual indicators for integration health
- **Configuration Wizards**: Step-by-step setup for complex integrations
- **Testing Tools**: Connection validation and troubleshooting
- **Sync Monitoring**: Real-time data synchronization status

### Subscription Management
- **Plan Comparison**: Visual comparison of subscription tiers
- **Usage Metrics**: Feature utilization and billing analytics
- **Billing History**: Detailed invoice and payment tracking
- **Add-on Management**: Feature toggle and pricing display

## Security Features

### Authentication & Authorization
- **Multi-factor Authentication**: SMS, email, and authenticator app support
- **Single Sign-On (SSO)**: Integration with enterprise identity providers
- **Session Management**: Automatic timeout and concurrent session limits
- **Password Policies**: Configurable complexity and rotation requirements

### Data Protection
- **Encryption**: At-rest and in-transit data protection
- **Access Logging**: Comprehensive audit trail for all settings changes
- **Data Retention**: Configurable retention policies for compliance
- **Privacy Controls**: GDPR and CCPA compliance features

### Compliance Monitoring
- **Regulatory Updates**: Automatic compliance requirement tracking
- **Audit Reports**: Scheduled compliance and security reports
- **Violation Alerts**: Real-time notifications for policy violations
- **Remediation Tracking**: Issue resolution and follow-up management

## Integration Specifications

### ELD System Integration
```javascript
// ELD Configuration Example
{
  "provider": "Garmin eLog",
  "api_endpoint": "https://api.garmin.com/v1",
  "authentication": {
    "type": "oauth2",
    "client_id": "encrypted_client_id",
    "client_secret": "encrypted_secret"
  },
  "sync_settings": {
    "hos_logs": true,
    "vehicle_data": true,
    "driver_status": true,
    "sync_interval": 300
  }
}
```

### Load Board Integration
```javascript
// Load Board Configuration Example
{
  "provider": "DAT Power",
  "api_key": "encrypted_api_key",
  "search_preferences": {
    "auto_search": true,
    "search_radius": 100,
    "equipment_types": ["dry_van", "reefer"],
    "rate_minimum": 2.50
  },
  "posting_settings": {
    "auto_post": false,
    "default_rate": 3.00,
    "contact_preferences": ["phone", "email"]
  }
}
```

### Port Integration
```javascript
// Port Integration Configuration
{
  "provider": "Port of Los Angeles",
  "services": {
    "container_tracking": true,
    "vessel_schedules": true,
    "terminal_appointments": true,
    "chassis_tracking": true
  },
  "alert_preferences": {
    "container_available": true,
    "vessel_delays": true,
    "chassis_required": true
  }
}
```

## Notification System

### Email Notifications
- **System Alerts**: Security, billing, and system status updates
- **Operational Notifications**: Load updates, driver assignments, delivery confirmations
- **Compliance Alerts**: DOT violations, inspection due dates, permit renewals
- **Custom Templates**: Branded email templates with company logos

### SMS Alerts
- **Critical Notifications**: System outages, security breaches, urgent operational issues
- **Driver Communications**: Assignment notifications, route updates, emergency alerts
- **Customer Updates**: Pickup confirmations, delivery notifications, delay alerts
- **Escalation Procedures**: Automated escalation for unacknowledged alerts

### Push Notifications
- **Mobile App Integration**: Real-time notifications for mobile users
- **Browser Notifications**: Desktop alerts for web application users
- **Customizable Preferences**: User-specific notification settings
- **Do Not Disturb**: Scheduled quiet hours and vacation settings

## Subscription Plans

### Starter Plan ($99/month)
- Basic dispatch and load management
- Up to 5 users
- Standard integrations
- Email support

### Professional Plan ($299/month)
- Advanced analytics and reporting
- Up to 25 users
- Premium integrations
- Phone and email support
- Container tracking add-on available

### Enterprise Plan ($699/month)
- Unlimited users
- Custom integrations
- Dedicated account manager
- Priority support
- All add-ons included

### Add-on Services
- **Container Tracking**: +$50/month
- **Advanced Analytics**: +$99/month
- **Custom Integrations**: Custom pricing
- **White-label Deployment**: Custom pricing

## Troubleshooting

### Common Issues
1. **Integration Connection Failures**
   - Verify API credentials
   - Check network connectivity
   - Validate configuration settings
   - Review error logs

2. **Permission Access Problems**
   - Confirm user role assignments
   - Check permission matrix
   - Verify company settings
   - Review audit logs

3. **Notification Delivery Issues**
   - Validate contact information
   - Check spam/filter settings
   - Verify notification preferences
   - Test delivery methods

### Support Procedures
- **Self-Service Portal**: Knowledge base and troubleshooting guides
- **Ticket System**: Structured support request management
- **Live Chat**: Real-time assistance for urgent issues
- **Phone Support**: Direct access for enterprise customers

---

## Recent Updates

- **June 27, 2025**: Implemented comprehensive subscription management with plan upgrades and add-on services
- **June 21, 2025**: Enhanced security settings with audit logging and compliance tracking
- **June 15, 2025**: Reorganized settings with comprehensive integrations management system
- **June 14, 2025**: Added production deployment configuration and feature flag management
- **June 14, 2025**: Implemented session management with 2-hour timeout and secure authentication