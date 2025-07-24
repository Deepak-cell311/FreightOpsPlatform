# Driver App Chassis Provider Alert System

## Overview
Comprehensive in-app notification system that automatically warns drivers about specific chassis provider requirements during container pickups. The system provides clear, actionable instructions without burdening drivers with cost information.

## Alert Types

### Critical Alerts (Red - Requires Acknowledgment)
**MAERSK Containers (MSKU prefix)**
- **Alert**: "USE TRAC CHASSIS ONLY - NO EXCEPTIONS"
- **Required**: TRAC Intermodal only
- **Prohibited**: All other providers
- **Display**: 10+ seconds, requires driver acknowledgment

### Warning Alerts (Orange)
**HAPAG Containers (HLXU prefix)**
- **Alert**: "USE DCLI OR TRAC CHASSIS ONLY"
- **Acceptable**: DCLI, TRAC Intermodal
- **Prohibited**: Flexi-Van, SeaCube Containers

**COSCO Containers (COSU prefix)**
- **Alert**: "AVOID DCLI CHASSIS - USE FLEXI-VAN OR TRAC"
- **Acceptable**: Flexi-Van, TRAC Intermodal
- **Prohibited**: DCLI

### Info Alerts (Blue)
**ONE Containers (ONEY prefix)**
- **Alert**: "FLEXI-VAN PREFERRED FOR ONE CONTAINERS"
- **Preferred**: Flexi-Van
- **Acceptable**: All providers

**Miami Port**
- **Alert**: "FLEXI-VAN OR SEACUBE RECOMMENDED"
- **Recommended**: Flexi-Van, SeaCube Containers

**Default**
- **Alert**: "ANY AVAILABLE CHASSIS PROVIDER ACCEPTABLE"
- **Acceptable**: All port providers

## Port-Specific Providers

### West Coast
- **Los Angeles (USLAX)**: TRAC, Flexi-Van, DCLI, SeaCube
- **Long Beach (USLGB)**: TRAC, Flexi-Van, DCLI, Direct ChassisLink
- **Oakland (USOAK)**: TRAC, Flexi-Van, DCLI
- **Seattle (USSEA)**: TRAC, DCLI, Milestone Equipment
- **Tacoma (USTAC)**: TRAC, DCLI, Milestone Equipment

### East Coast
- **New York/New Jersey (USNYC)**: Flexi-Van, DCLI, CAI, Milestone
- **Baltimore (USBAL)**: TRAC, Flexi-Van, CAI
- **Savannah (USSAV)**: TRAC, Flexi-Van, DCLI

### Gulf Coast
- **Houston (USHOU)**: TRAC, Flexi-Van, DCLI, CAI
- **Miami (USMIA)**: Flexi-Van, DCLI, SeaCube

## Driver App Integration (Future)

### API Endpoint
```
POST /api/driver/container-pickup-alert
```

### Request Format
```json
{
  "containerNumber": "MSKU1234567",
  "portCode": "USLAX",
  "driverId": "driver_001",
  "loadId": "LD-2025-001",
  "sslOwner": "MAERSK"
}
```

### Response Format
```json
{
  "driverAppAlert": {
    "alertType": "chassis_pickup",
    "alertLevel": "critical",
    "title": "MAERSK Container Alert",
    "message": "MAERSK container MSKU1234567",
    "instruction": "USE TRAC CHASSIS ONLY - NO EXCEPTIONS",
    "requiredProvider": "TRAC Intermodal",
    "prohibitedProviders": ["Flexi-Van", "DCLI", "SeaCube Containers"],
    "acceptableProviders": ["TRAC Intermodal"],
    "displayDuration": 10000,
    "requiresAcknowledgment": true,
    "timestamp": "2025-06-18T18:00:00Z"
  }
}
```

### Mobile App Display Examples

**Critical Alert**
```
🔴 MAERSK CONTAINER ALERT
Container: MSKU1234567
Port: Los Angeles

USE TRAC CHASSIS ONLY
NO EXCEPTIONS

[ACKNOWLEDGE] [CONTACT DISPATCH]
```

**Warning Alert**
```
🟠 HAPAG CONTAINER ALERT
Container: HLXU9876543
Port: Long Beach

USE DCLI OR TRAC CHASSIS ONLY
Avoid: Flexi-Van, SeaCube

[OK] [MORE INFO]
```

**Info Alert**
```
🔵 ONE CONTAINER
Container: ONEY5555555
Port: Oakland

FLEXI-VAN PREFERRED
Any provider acceptable

[OK]
```

## Implementation Benefits

1. **Driver Clarity**: Simple, clear instructions without cost burden
2. **Error Prevention**: Prevents costly chassis provider mistakes
3. **Operational Efficiency**: Reduces dispatch calls and delays
4. **Cost Control**: Ensures optimal chassis selection for each container
5. **Compliance**: Maintains SSL-specific chassis requirements
6. **Future Ready**: API ready for mobile app integration

## Cost Tracking (Internal Use Only)

The system simultaneously provides dispatch with cost optimization data:
- Regional pricing differences
- Weekly/monthly rate opportunities
- Provider cost comparisons
- Potential savings calculations

This separation ensures drivers focus on operations while dispatch optimizes costs.