# Missing Module Implementation Plan
**Date: July 11, 2025**
**Priority: HIGH - Production Blocker**

## IMPLEMENTATION ROADMAP

### Phase 1: Critical Business Modules (Priority 1)
**Timeline: 2-3 days**

#### 1. Customer Module
```sql
-- Add customers table
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  name TEXT NOT NULL,
  contactPerson TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zipCode TEXT,
  creditLimit DECIMAL(10,2),
  paymentTerms INTEGER,
  status TEXT DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

#### 2. Vendor Module
```sql
-- Add vendors table
CREATE TABLE vendors (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  name TEXT NOT NULL,
  contactPerson TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zipCode TEXT,
  paymentTerms INTEGER,
  status TEXT DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

#### 3. Compliance Module
```sql
-- Add compliance tables
CREATE TABLE compliance_records (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  type TEXT NOT NULL, -- 'safety', 'dot', 'fmcsa'
  status TEXT NOT NULL,
  dueDate TIMESTAMP,
  completedDate TIMESTAMP,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Phase 2: Operational Modules (Priority 2)
**Timeline: 3-4 days**

#### 4. Maintenance Module
```sql
-- Add maintenance tables
CREATE TABLE maintenance_schedules (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  vehicleId TEXT NOT NULL,
  serviceType TEXT NOT NULL,
  intervalMiles INTEGER,
  intervalDays INTEGER,
  lastServiceDate TIMESTAMP,
  nextServiceDate TIMESTAMP,
  status TEXT DEFAULT 'scheduled',
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### 5. Fuel Module
```sql
-- Add fuel tables
CREATE TABLE fuel_transactions (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  vehicleId TEXT,
  driverId TEXT,
  amount DECIMAL(10,2),
  gallons DECIMAL(8,2),
  pricePerGallon DECIMAL(5,2),
  location TEXT,
  transactionDate TIMESTAMP,
  cardNumber TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### 6. Insurance Module
```sql
-- Add insurance tables
CREATE TABLE insurance_policies (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  policyType TEXT NOT NULL, -- 'liability', 'cargo', 'physical_damage'
  provider TEXT NOT NULL,
  policyNumber TEXT,
  coverageAmount DECIMAL(12,2),
  premium DECIMAL(10,2),
  effectiveDate TIMESTAMP,
  expirationDate TIMESTAMP,
  status TEXT DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Phase 3: Support Modules (Priority 3)
**Timeline: 2-3 days**

#### 7. Documents Module
```sql
-- Add documents table
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  type TEXT NOT NULL, -- 'driver_license', 'medical_card', 'insurance'
  ownerId TEXT, -- driver ID or vehicle ID
  ownerType TEXT, -- 'driver' or 'vehicle'
  fileName TEXT,
  fileSize INTEGER,
  mimeType TEXT,
  expirationDate TIMESTAMP,
  status TEXT DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### 8. Training Module
```sql
-- Add training tables
CREATE TABLE training_courses (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- in minutes
  isRequired BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### 9. Inventory Module
```sql
-- Add inventory tables
CREATE TABLE inventory_parts (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  partNumber TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 0,
  unitCost DECIMAL(10,2),
  reorderLevel INTEGER,
  supplier TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Phase 4: Advanced Modules (Priority 4)
**Timeline: 3-4 days**

#### 10. Analytics Module
```sql
-- Add analytics tables
CREATE TABLE analytics_metrics (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  metricType TEXT NOT NULL, -- 'performance', 'financial', 'operational'
  metricName TEXT NOT NULL,
  value DECIMAL(15,2),
  period TEXT, -- 'daily', 'weekly', 'monthly'
  recordDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### 11. Reports Module
```sql
-- Add reports tables
CREATE TABLE report_templates (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'financial', 'operational', 'compliance'
  template TEXT, -- JSON template
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### 12. Mobile Module
```sql
-- Add mobile tables
CREATE TABLE mobile_sessions (
  id TEXT PRIMARY KEY,
  driverId TEXT NOT NULL,
  deviceId TEXT,
  platform TEXT, -- 'ios', 'android'
  appVersion TEXT,
  lastActiveAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## IMPLEMENTATION APPROACH

### Database Schema Strategy
1. **Add all missing tables** to shared/schema.ts
2. **Run database migration** using `npm run db:push`
3. **Verify table creation** in production database

### API Endpoint Strategy
1. **Create endpoint templates** following existing patterns
2. **Implement basic CRUD operations** for each module
3. **Add authentication middleware** for all endpoints
4. **Test with authentic data** responses

### Business Logic Strategy
1. **Follow existing service patterns** from working modules
2. **Implement tenant isolation** for all queries
3. **Add proper error handling** and logging
4. **Maintain data integrity** standards

## SUCCESS METRICS
- **100% Module Coverage** - All 22 modules functional
- **Zero Mock Data** - All authentic database responses
- **Complete API Coverage** - All 44+ endpoints working
- **Production Ready** - Full system deployment capability

## RESOURCE REQUIREMENTS
- **Development Time**: 10-12 days total
- **Database Updates**: 12 new tables minimum
- **API Endpoints**: 26+ new endpoints
- **Business Logic**: 12 new service modules

## RECOMMENDATION
Proceed with immediate implementation of Phase 1 (Critical Business Modules) to achieve minimum viable product status for transportation companies.