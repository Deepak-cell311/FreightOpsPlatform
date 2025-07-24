# FreightOps Pro - Dispatch Module Documentation

## Overview

The Dispatch Module is the operational heart of FreightOps Pro, providing comprehensive load management, driver assignment, route optimization, and real-time tracking capabilities for transportation and logistics operations.

## Core Features

### Load Management
- **Load Creation**: Multi-modal load creation supporting container, reefer, and hazmat shipments
- **Load Tracking**: Real-time status updates and location tracking
- **Load Assignment**: Driver and equipment assignment with rate calculations
- **Multi-Stop Support**: Unlimited pickup and delivery stops per load
- **Documentation**: BOL, rate confirmations, and delivery receipts

### Driver Assignment & Dispatch
- **Intelligent Assignment**: Automatic driver matching based on location, availability, and qualifications
- **Rate Integration**: Direct pull from driver profiles for accurate cost calculations
- **Dispatch Instructions**: Custom leg additions and special handling requirements
- **Communication**: Direct messaging and notification system

### Real-Time Tracking
- **GPS Integration**: Live vehicle location tracking via Google Maps API
- **Status Updates**: Real-time load and driver status monitoring
- **ETA Calculations**: Dynamic arrival time estimates based on traffic and route conditions
- **Geofencing**: Automated alerts for pickup/delivery locations

### Container Management
- **Intermodal Tracking**: 13-field container tracking integration
- **Chassis Management**: Automatic chassis assignment and return scheduling
- **Port Integration**: Real-time container status from major US ports
- **Demurrage Tracking**: Cost monitoring and optimization recommendations

## API Endpoints

### Load Management
```
GET /api/dispatch/loads - Retrieve company loads
POST /api/dispatch/loads - Create new load
PUT /api/dispatch/loads/:id - Update load details
DELETE /api/dispatch/loads/:id - Remove load

GET /api/dispatch/loads/:id/tracking - Get load tracking status
POST /api/dispatch/loads/:id/status - Update load status
```

### Driver Assignment
```
GET /api/dispatch/drivers/available - Get available drivers
POST /api/dispatch/assign - Assign driver to load
PUT /api/dispatch/assignment/:id - Update assignment details
DELETE /api/dispatch/assignment/:id - Remove assignment
```

### Container Operations
```
POST /api/dispatch/container/track - Enable container tracking
GET /api/dispatch/container/:id/status - Get container status
POST /api/dispatch/container/chassis - Assign chassis to driver
```

## Database Schema

### Loads Table
```sql
loads (
  id VARCHAR PRIMARY KEY,
  company_id UUID NOT NULL,
  load_number VARCHAR UNIQUE,
  status VARCHAR,
  priority VARCHAR,
  customer_name VARCHAR,
  customer_contact VARCHAR,
  customer_phone VARCHAR,
  customer_email VARCHAR,
  pickup_date DATE,
  delivery_date DATE,
  pickup_address TEXT,
  delivery_address TEXT,
  equipment_type VARCHAR,
  weight DECIMAL,
  commodity VARCHAR,
  rate DECIMAL,
  miles DECIMAL,
  driver_id INTEGER,
  truck_id INTEGER,
  trailer_id INTEGER,
  -- Container fields
  is_container_load BOOLEAN,
  container_number VARCHAR,
  booking_number VARCHAR,
  seal_number VARCHAR,
  port_of_loading VARCHAR,
  port_of_discharge VARCHAR,
  vessel_name VARCHAR,
  voyage_number VARCHAR,
  -- Temperature control
  is_temperature_controlled BOOLEAN,
  temperature_min INTEGER,
  temperature_max INTEGER,
  -- Hazmat
  is_hazmat BOOLEAN,
  hazmat_class VARCHAR,
  un_number VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Dispatch Assignments
```sql
dispatch_assignments (
  id UUID PRIMARY KEY,
  load_id VARCHAR NOT NULL,
  driver_id INTEGER NOT NULL,
  company_id UUID NOT NULL,
  assigned_at TIMESTAMP,
  status VARCHAR DEFAULT 'assigned',
  pickup_appointment TIMESTAMP,
  delivery_appointment TIMESTAMP,
  special_instructions TEXT,
  rate_per_mile DECIMAL,
  total_rate DECIMAL,
  created_at TIMESTAMP
)
```

## Frontend Components

### Load Creation Interface
- **Multi-tab Design**: Manual Entry, OCR Upload, Bulk Import
- **Smart Forms**: Dynamic fields based on load type
- **Rate Calculator**: Automatic rate calculation based on distance and type
- **Document Upload**: Support for rate confirmations and shipping docs

### Dispatch Board
- **Live Map**: Real-time driver and load locations
- **Status Dashboard**: Load pipeline and driver availability
- **Assignment Interface**: Drag-and-drop driver assignment
- **Communication Panel**: Driver messaging and alerts

### Container Tracking
- **Port Integration**: Real-time container status from major ports
- **Cost Tracking**: Demurrage, chassis rental, and storage charges
- **Optimization Dashboard**: Cost-saving recommendations
- **Alert System**: Deadline and chassis return notifications

## Integration Points

### Google Maps API
- Real-time vehicle tracking
- Route optimization
- ETA calculations
- Geofencing capabilities

### Port Systems
- Container status tracking
- Vessel schedule integration
- Chassis provider mapping
- Port-specific pricing

### Driver Mobile App
- Load assignment notifications
- Status update capabilities
- Navigation integration
- Document capture

## Security & Access Control

### Role-Based Permissions
- **Dispatcher**: Full load and assignment management
- **Driver**: View assigned loads, update status
- **Admin**: All dispatch functions plus reporting
- **Customer**: View load status only

### Data Protection
- Multi-tenant isolation by company ID
- Encrypted sensitive data (customer info, rates)
- Audit logging for all dispatch actions
- Secure API authentication

## Performance Optimization

### Caching Strategy
- Real-time location data caching
- Driver availability status caching
- Load status update buffering
- Map tile caching for offline capability

### Database Optimization
- Indexed queries for load searches
- Partition tables by company and date
- Optimized joins for dispatch board queries
- Real-time triggers for status updates

## Reporting & Analytics

### Operational Metrics
- Load completion rates
- On-time delivery performance
- Driver utilization rates
- Equipment efficiency

### Financial Tracking
- Revenue per load
- Cost per mile analysis
- Driver pay calculations
- Container cost optimization

### Compliance Reporting
- HOS compliance tracking
- Safety performance monitoring
- Route efficiency analysis
- Customer satisfaction metrics

## Mobile Integration

### Driver App Features
- Load assignment acceptance
- Real-time status updates
- Navigation and routing
- Document capture and upload
- Electronic signature capability

### Customer Portal
- Real-time load tracking
- Delivery confirmation
- Document access
- Communication portal

## Troubleshooting

### Common Issues
1. **GPS Tracking Not Working**
   - Verify Google Maps API key
   - Check driver app permissions
   - Validate network connectivity

2. **Load Assignment Failures**
   - Verify driver availability
   - Check equipment compatibility
   - Validate rate calculations

3. **Container Tracking Issues**
   - Confirm container number format
   - Verify port API connections
   - Check tracking configuration

### Support Procedures
- Real-time system monitoring
- Automated error alerting
- Escalation procedures
- Performance monitoring dashboards

---

## Recent Updates

- **June 27, 2025**: Enhanced container tracking with 13-field integration
- **June 18, 2025**: Added chassis management system with port-specific pricing
- **June 17, 2025**: Implemented comprehensive load creation with automatic dispatch generation
- **June 15, 2025**: Consolidated dispatch tracking into comprehensive overview page
- **June 14, 2025**: Fixed Google Maps integration with real-time vehicle tracking