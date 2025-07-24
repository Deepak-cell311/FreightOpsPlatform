-- FreightOps Pro Demo Data Population
-- This script populates the database with realistic demo data for investor presentations

-- Add sample loads with realistic data
INSERT INTO loads (
    id, companyid, loadnumber, status, priority, customername, customercontact, 
    customerphone, customeremail, pickuplocation, pickupaddress, pickupcity, 
    pickupstate, pickupzip, pickupdate, pickuptime, pickupwindow, pickup_contact, 
    pickup_phone, deliverylocation, deliveryaddress, deliverycity, deliverystate, 
    deliveryzip, deliverydate, deliverytime, delivery_window, delivery_contact, 
    delivery_phone, commodity, weight, pieces, length, width, height, rate, 
    rateType, totalrate, distance, estimatedmiles, estimatedduration, createdat
) VALUES 
-- Active loads
('load-001', 'company-1', 'FL-2025-001', 'active', 'standard', 'Amazon Logistics', 'Sarah Johnson', 
 '555-0123', 'dispatch@amazon.com', 'Miami Distribution Center', '1850 NW 84th Ave', 'Miami', 
 'FL', '33126', '2025-07-11', '08:00', '08:00-10:00', 'Mike Rodriguez', '555-0145', 
 'Atlanta Fulfillment Center', '1435 Northside Dr NW', 'Atlanta', 'GA', '30318', 
 '2025-07-12', '14:00', '14:00-16:00', 'Jennifer Lee', '555-0167', 'Electronics', 
 24500, 15, 48.5, 8.2, 9.5, 3250.00, 'flat', 3250.00, 650, 650, 12, NOW()),

('load-002', 'company-1', 'TX-2025-002', 'active', 'urgent', 'Home Depot Supply', 'Robert Chen', 
 '555-0234', 'logistics@homedepot.com', 'Houston Distribution Hub', '7500 Bellaire Blvd', 'Houston', 
 'TX', '77036', '2025-07-11', '06:00', '06:00-08:00', 'Carlos Martinez', '555-0245', 
 'Denver Regional Center', '9500 E 40th Ave', 'Denver', 'CO', '80238', 
 '2025-07-13', '10:00', '10:00-12:00', 'Amanda Thompson', '555-0267', 'Building Materials', 
 45000, 28, 53.0, 8.5, 10.2, 4850.00, 'flat', 4850.00, 1050, 1050, 18, NOW()),

('load-003', 'company-1', 'CA-2025-003', 'active', 'standard', 'Walmart Distribution', 'Lisa Park', 
 '555-0345', 'freight@walmart.com', 'Los Angeles Port Complex', '2980 N Alameda St', 'Los Angeles', 
 'CA', '90031', '2025-07-11', '12:00', '12:00-14:00', 'David Kim', '555-0356', 
 'Phoenix Distribution Center', '4750 W Lower Buckeye Rd', 'Phoenix', 'AZ', '85043', 
 '2025-07-12', '18:00', '18:00-20:00', 'Maria Garcia', '555-0378', 'General Merchandise', 
 38750, 22, 50.0, 8.0, 9.0, 2950.00, 'flat', 2950.00, 485, 485, 8, NOW()),

-- Completed loads from this month
('load-004', 'company-1', 'NY-2025-004', 'delivered', 'standard', 'FedEx Ground', 'John Williams', 
 '555-0456', 'operations@fedex.com', 'Newark Distribution Center', '125 Freight St', 'Newark', 
 'NJ', '07114', '2025-07-08', '07:00', '07:00-09:00', 'Tom Anderson', '555-0467', 
 'Baltimore Hub', '7101 Riverdale Rd', 'Baltimore', 'MD', '21237', 
 '2025-07-09', '15:00', '15:00-17:00', 'Rachel Green', '555-0478', 'Packages', 
 32000, 18, 48.0, 8.0, 9.0, 2780.00, 'flat', 2780.00, 420, 420, 6, '2025-07-08 07:00:00'),

('load-005', 'company-1', 'IL-2025-005', 'delivered', 'urgent', 'UPS Logistics', 'Michael Brown', 
 '555-0567', 'dispatch@ups.com', 'Chicago Distribution Center', '1400 S Jefferson St', 'Chicago', 
 'IL', '60607', '2025-07-05', '05:00', '05:00-07:00', 'Steve Wilson', '555-0578', 
 'Detroit Regional Hub', '2800 Middlebelt Rd', 'Detroit', 'MI', '48214', 
 '2025-07-06', '16:00', '16:00-18:00', 'Nicole Davis', '555-0589', 'Automotive Parts', 
 41500, 25, 52.0, 8.5, 9.5, 3650.00, 'flat', 3650.00, 580, 580, 10, '2025-07-05 05:00:00'),

('load-006', 'company-1', 'OH-2025-006', 'delivered', 'standard', 'Amazon Prime', 'Emily Johnson', 
 '555-0678', 'prime@amazon.com', 'Columbus Fulfillment Center', '8000 Green Meadows Dr', 'Columbus', 
 'OH', '43016', '2025-07-03', '09:00', '09:00-11:00', 'Mark Taylor', '555-0689', 
 'Pittsburgh Distribution Center', '1200 Galveston Ave', 'Pittsburgh', 'PA', '15233', 
 '2025-07-04', '13:00', '13:00-15:00', 'Sarah Miller', '555-0690', 'Consumer Electronics', 
 28900, 16, 47.0, 8.0, 8.5, 2450.00, 'flat', 2450.00, 380, 380, 7, '2025-07-03 09:00:00');

-- Update truck statuses to reflect active operations
UPDATE trucks SET status = 'in_transit', 
    currentlocation = 'I-75 North, mile marker 245 - Georgia',
    lastupdate = NOW(),
    updatedat = NOW()
WHERE id IN ('truck-001');

UPDATE trucks SET status = 'available', 
    currentlocation = 'Company Yard - Miami, FL',
    lastupdate = NOW(),
    updatedat = NOW()
WHERE id IN ('truck-002');

-- Add some recent invoices for revenue calculations
INSERT INTO invoices (
    id, companyid, customername, invoicenumber, amount, totalamount, 
    duedate, status, createdat
) VALUES 
('inv-001', 'company-1', 'Amazon Logistics', 'INV-2025-001', 2780.00, 2780.00, 
 '2025-07-23', 'paid', '2025-07-09 10:00:00'),
('inv-002', 'company-1', 'UPS Logistics', 'INV-2025-002', 3650.00, 3650.00, 
 '2025-07-20', 'paid', '2025-07-06 11:00:00'),
('inv-003', 'company-1', 'Amazon Prime', 'INV-2025-003', 2450.00, 2450.00, 
 '2025-07-18', 'paid', '2025-07-04 12:00:00'),
('inv-004', 'company-1', 'FedEx Ground', 'INV-2025-004', 2780.00, 2780.00, 
 '2025-07-25', 'pending', '2025-07-10 09:00:00');

-- Add some alerts for operational awareness
INSERT INTO alerts (
    id, companyid, type, title, message, severity, status, createdat
) VALUES 
('alert-001', 'company-1', 'maintenance', 'Truck Maintenance Due', 
 'Truck T-001 requires preventive maintenance in 2 days', 'medium', 'active', NOW()),
('alert-002', 'company-1', 'delivery', 'Delivery Delay Risk', 
 'Load FL-2025-001 may experience delays due to weather conditions', 'low', 'active', NOW()),
('alert-003', 'company-1', 'compliance', 'Driver Hours Alert', 
 'Driver John Smith approaching HOS limits', 'high', 'active', NOW());