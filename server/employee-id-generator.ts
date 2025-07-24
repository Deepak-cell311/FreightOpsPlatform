/**
 * Employee ID Generator for FreightOps Pro HQ Staff
 * Generates unique random numerical employee identifiers
 */

import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Generate a random numerical employee ID
 * Format: 6-digit number (100000-999999)
 * Ensures uniqueness across all HQ employees
 */
export async function generateEmployeeId(): Promise<string> {
  const maxAttempts = 100;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    // Generate 6-digit random number
    const randomId = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Check if this ID already exists
    const existingEmployee = await db.execute(sql`
      SELECT id FROM hq_employees WHERE employee_id = ${randomId}
    `);
    
    if (existingEmployee.rows.length === 0) {
      return randomId;
    }
    
    attempts++;
  }
  
  throw new Error('Unable to generate unique employee ID after maximum attempts');
}

/**
 * Update existing employee with new random numerical ID
 */
export async function updateEmployeeId(employeeId: string): Promise<string> {
  const newId = await generateEmployeeId();
  
  await db.execute(sql`
    UPDATE hq_employees 
    SET employee_id = ${newId}, updated_at = NOW()
    WHERE employee_id = ${employeeId}
  `);
  
  return newId;
}

/**
 * Migrate all existing employees to random numerical IDs
 */
export async function migrateEmployeeIds(): Promise<void> {
  console.log('🔄 Migrating employee IDs to random numerical format...');
  
  // Get all employees with non-numerical IDs
  const employees = await db.execute(sql`
    SELECT id, employee_id, email, first_name, last_name
    FROM hq_employees 
    WHERE employee_id !~ '^[0-9]+$'
  `);
  
  console.log(`Found ${employees.rows.length} employees to migrate`);
  
  for (const employee of employees.rows) {
    const newId = await generateEmployeeId();
    
    await db.execute(sql`
      UPDATE hq_employees 
      SET employee_id = ${newId}, updated_at = NOW()
      WHERE id = ${employee.id}
    `);
    
    console.log(`✅ Migrated ${employee.first_name} ${employee.last_name} (${employee.email}): ${employee.employee_id} → ${newId}`);
  }
  
  console.log('✅ Employee ID migration complete');
}