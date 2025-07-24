-- FreightOps Pro Database Schema for Neon
-- Run this script in your Neon SQL Editor to create all tables

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  address VARCHAR,
  city VARCHAR,
  state VARCHAR,
  zipCode VARCHAR,
  dotNumber VARCHAR,
  mcNumber VARCHAR,
  ein VARCHAR,
  businessType VARCHAR,
  yearsInBusiness INTEGER,
  numberOfTrucks INTEGER,
  walletBalance DECIMAL(10,2) DEFAULT 0,
  subscriptionStatus VARCHAR DEFAULT 'trial',
  subscriptionPlan VARCHAR DEFAULT 'starter',
  stripeCustomerId VARCHAR,
  unitAccountId VARCHAR,
  gustoCompanyId VARCHAR,
  gustoAccessToken VARCHAR,
  gustoRefreshToken VARCHAR,
  gustoTokenExpiry TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  handlesContainers BOOLEAN DEFAULT false,
  containerTrackingEnabled BOOLEAN DEFAULT false
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  companyId VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  firstName VARCHAR NOT NULL,
  lastName VARCHAR NOT NULL,
  phone VARCHAR,
  role VARCHAR DEFAULT 'user',
  isActive BOOLEAN DEFAULT true,
  lastLogin TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  companyId VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  firstName VARCHAR NOT NULL,
  lastName VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR NOT NULL,
  licenseNumber VARCHAR NOT NULL,
  licenseClass VARCHAR,
  licenseExpiry DATE,
  dateOfBirth DATE,
  address VARCHAR,
  city VARCHAR,
  state VARCHAR,
  zipCode VARCHAR,
  emergencyContact VARCHAR,
  emergencyPhone VARCHAR,
  hireDate DATE,
  status VARCHAR DEFAULT 'active',
  payRate DECIMAL(10,2),
  payType VARCHAR DEFAULT 'percentage',
  hoursRemaining VARCHAR,
  currentLocation VARCHAR,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trucks table
CREATE TABLE IF NOT EXISTS trucks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  companyId VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  truckNumber VARCHAR NOT NULL,
  make VARCHAR NOT NULL,
  model VARCHAR NOT NULL,
  year INTEGER NOT NULL,
  vin VARCHAR NOT NULL,
  licensePlate VARCHAR NOT NULL,
  registrationState VARCHAR,
  status VARCHAR DEFAULT 'available',
  currentLocation VARCHAR,
  mileage INTEGER DEFAULT 0,
  fuelType VARCHAR DEFAULT 'diesel',
  fuelEfficiency VARCHAR,
  maintenanceStatus VARCHAR DEFAULT 'up_to_date',
  lastMaintenanceDate DATE,
  nextMaintenanceDate DATE,
  insuranceProvider VARCHAR,
  insurancePolicyNumber VARCHAR,
  insuranceExpiry DATE,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loads table
CREATE TABLE IF NOT EXISTS loads (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  companyId VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  loadNumber VARCHAR NOT NULL,
  customerName VARCHAR NOT NULL,
  customerContact VARCHAR,
  customerPhone VARCHAR,
  customerEmail VARCHAR,
  pickupLocation VARCHAR NOT NULL,
  pickupAddress VARCHAR,
  pickupCity VARCHAR,
  pickupState VARCHAR,
  pickupZip VARCHAR,
  deliveryLocation VARCHAR NOT NULL,
  deliveryAddress VARCHAR,
  deliveryCity VARCHAR,
  deliveryState VARCHAR,
  deliveryZip VARCHAR,
  pickupDate TIMESTAMP NOT NULL,
  deliveryDate TIMESTAMP NOT NULL,
  status VARCHAR DEFAULT 'pending',
  commodity VARCHAR NOT NULL,
  weight DECIMAL(10,2),
  pieces INTEGER,
  rate DECIMAL(10,2) NOT NULL,
  miles INTEGER,
  priority VARCHAR DEFAULT 'normal',
  notes TEXT,
  containerNumber VARCHAR,
  bookingNumber VARCHAR,
  sealNumber VARCHAR,
  chassisNumber VARCHAR,
  isContainerLoad BOOLEAN DEFAULT false,
  temperatureMin INTEGER,
  temperatureMax INTEGER,
  isHazmat BOOLEAN DEFAULT false,
  hazmatClass VARCHAR,
  unNumber VARCHAR,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deliveredAt TIMESTAMP,
  length VARCHAR
);

-- Sample data for testing
INSERT INTO companies (id, name, email, phone, dotNumber, mcNumber, address, city, state, zipCode, numberOfTrucks, subscriptionPlan) VALUES
('company-1', 'FreightOps Inc', 'admin@freightops.com', '555-0123', '3988790', 'MC-1495742', '101 Park Avenue Building Suite 1300', 'Oklahoma City', 'OK', '73020', 5, 'enterprise'),
('company-2', 'Logistics Pro LLC', 'contact@logisticspro.com', '555-0456', '1234567', 'MC-987654', '200 Main Street', 'Dallas', 'TX', '75201', 3, 'pro'),
('company-3', 'Transport Solutions', 'info@transportsolutions.com', '555-0789', '7654321', 'MC-456789', '300 Commerce Blvd', 'Atlanta', 'GA', '30309', 2, 'starter');

INSERT INTO users (id, companyId, email, password, firstName, lastName, role) VALUES
('user-1', 'company-1', 'admin@freightops.com', '$2b$10$rOvVudWNwvs.bBmkNzPl9uYc4V6eYYL.3L8zRsJ.Gc5VcU8hZMCCW', 'Admin', 'User', 'admin'),
('user-2', 'company-2', 'manager@logisticspro.com', '$2b$10$rOvVudWNwvs.bBmkNzPl9uYc4V6eYYL.3L8zRsJ.Gc5VcU8hZMCCW', 'John', 'Manager', 'admin'),
('user-3', 'company-3', 'owner@transportsolutions.com', '$2b$10$rOvVudWNwvs.bBmkNzPl9uYc4V6eYYL.3L8zRsJ.Gc5VcU8hZMCCW', 'Sarah', 'Owner', 'admin');

INSERT INTO drivers (id, companyId, firstName, lastName, email, phone, licenseNumber, licenseClass, payRate, payType, status) VALUES
('driver-1', 'company-1', 'Mike', 'Johnson', 'mike.johnson@freightops.com', '555-1111', 'CDL123456', 'CDL-A', 0.60, 'percentage', 'active'),
('driver-2', 'company-1', 'Sarah', 'Williams', 'sarah.williams@freightops.com', '555-2222', 'CDL789012', 'CDL-A', 0.58, 'percentage', 'active'),
('driver-3', 'company-2', 'Tom', 'Davis', 'tom.davis@logisticspro.com', '555-3333', 'CDL345678', 'CDL-A', 0.55, 'percentage', 'active'),
('driver-4', 'company-3', 'Lisa', 'Brown', 'lisa.brown@transportsolutions.com', '555-4444', 'CDL901234', 'CDL-A', 0.62, 'percentage', 'active');

INSERT INTO trucks (id, companyId, truckNumber, make, model, year, vin, licensePlate, status, mileage, fuelType) VALUES
('truck-1', 'company-1', 'T001', 'Freightliner', 'Cascadia', 2022, '1FUJGHDV8NLAA1234', 'OK-FR001', 'available', 125000, 'diesel'),
('truck-2', 'company-1', 'T002', 'Peterbilt', '579', 2021, '1XP5DB9X1MD123456', 'OK-FR002', 'in_transit', 98000, 'diesel'),
('truck-3', 'company-2', 'LP001', 'Kenworth', 'T680', 2023, '1XKWDB0X2PJ789012', 'TX-LP001', 'available', 45000, 'diesel'),
('truck-4', 'company-3', 'TS001', 'Volvo', 'VNL', 2020, '4V4NC9EH8LN345678', 'GA-TS001', 'maintenance', 210000, 'diesel');

INSERT INTO loads (id, companyId, loadNumber, customerName, pickupLocation, deliveryLocation, pickupDate, deliveryDate, commodity, weight, rate, status, miles) VALUES
('load-1', 'company-1', 'FO-2025-001', 'Amazon Logistics', 'Los Angeles, CA', 'Phoenix, AZ', '2025-01-15 08:00:00', '2025-01-16 17:00:00', 'Consumer Electronics', 42000.00, 2850.00, 'in_transit', 385),
('load-2', 'company-1', 'FO-2025-002', 'Walmart Distribution', 'Dallas, TX', 'Oklahoma City, OK', '2025-01-16 06:00:00', '2025-01-16 18:00:00', 'General Merchandise', 48500.00, 1200.00, 'pending', 205),
('load-3', 'company-1', 'FO-2025-003', 'Home Depot', 'Atlanta, GA', 'Jacksonville, FL', '2025-01-17 09:00:00', '2025-01-18 15:00:00', 'Building Materials', 52000.00, 1850.00, 'assigned', 345),
('load-4', 'company-2', 'LP-2025-001', 'Target Corporation', 'Chicago, IL', 'Milwaukee, WI', '2025-01-15 10:00:00', '2025-01-15 20:00:00', 'Retail Goods', 38000.00, 950.00, 'delivered', 95),
('load-5', 'company-2', 'LP-2025-002', 'Kroger Foods', 'Houston, TX', 'San Antonio, TX', '2025-01-16 05:00:00', '2025-01-16 14:00:00', 'Groceries', 44000.00, 1100.00, 'in_transit', 190),
('load-6', 'company-3', 'TS-2025-001', 'FedEx Ground', 'Memphis, TN', 'Nashville, TN', '2025-01-17 07:00:00', '2025-01-17 16:00:00', 'Packages', 25000.00, 750.00, 'pending', 210),
('load-7', 'company-1', 'FO-2025-004', 'UPS Freight', 'Denver, CO', 'Salt Lake City, UT', '2025-01-18 08:00:00', '2025-01-19 19:00:00', 'Mixed Freight', 49500.00, 2200.00, 'available', 525),
('load-8', 'company-1', 'FO-2025-005', 'Costco Wholesale', 'Seattle, WA', 'Portland, OR', '2025-01-19 06:00:00', '2025-01-19 17:00:00', 'Bulk Goods', 53000.00, 1400.00, 'available', 175);