#!/usr/bin/env tsx
/**
 * Migration script to convert EMP-001 format to random numerical employee IDs
 * Run this script to update all existing HQ employees
 */

import { migrateEmployeeIds } from './employee-id-generator';

async function main() {
  try {
    await migrateEmployeeIds();
    console.log('✅ Employee ID migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();