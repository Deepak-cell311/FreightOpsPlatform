/**
 * HR Management Routes - Separate endpoints for HQ and Tenant HR
 * HQ: Employee management for FreightOps Pro staff
 * Tenant: Driver/employee management for motor carrier companies
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { gustoService } from '../services/gusto-service';
import { createTenStreetService } from '../services/tenstreet-service';
import { requireHQRole, requirePermission, HQ_ROLES, PERMISSIONS } from '../hq-rbac';
import { nanoid } from 'nanoid';

const router = Router();

// Authentication middleware for HR routes
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user || !req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// ===============================
// HQ EMPLOYEE MANAGEMENT (FreightOps Pro Staff)
// ===============================

// Get all HQ employees (HR Department access)
router.get('/hq/employees', requirePermission([PERMISSIONS.HR_EMPLOYEE_VIEW]), async (req: any, res) => {
  try {
    const employees = await storage.getAllHQEmployees();
    res.json({ employees });
  } catch (error) {
    console.error('Error fetching HQ employees:', error);
    res.status(500).json({ message: 'Failed to fetch HQ employees' });
  }
});

// Get specific HQ employee by ID
router.get('/hq/employees/:employeeId', requirePermission([PERMISSIONS.HR_EMPLOYEE_VIEW]), async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await storage.getHQEmployeeById(employeeId);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Error fetching HQ employee:', error);
    res.status(500).json({ message: 'Failed to fetch HQ employee' });
  }
});

// Create new HQ employee
router.post('/hq/employees', requirePermission([PERMISSIONS.HR_EMPLOYEE_CREATE]), async (req: any, res) => {
  try {
    const { firstName, lastName, email, phone, role, department, position, password } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !role || !department || !position || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if email already exists
    const existingEmployee = await storage.getHQEmployeeByEmail(email);
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Generate unique employee ID
    const employeeId = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const employeeData = {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      role,
      department,
      position,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const newEmployee = await storage.createHQEmployee(employeeData);
    
    // Remove password from response
    const { password: _, ...employeeResponse } = newEmployee;
    
    res.status(201).json(employeeResponse);
  } catch (error) {
    console.error('Error creating HQ employee:', error);
    res.status(500).json({ message: 'Failed to create HQ employee' });
  }
});

// Update HQ employee
router.put('/hq/employees/:employeeId', requirePermission([PERMISSIONS.HR_EMPLOYEE_EDIT]), async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields from update
    delete updateData.password;
    delete updateData.employeeId;
    delete updateData.createdAt;
    
    updateData.updatedAt = new Date();
    
    const updatedEmployee = await storage.updateHQEmployee(employeeId, updateData);
    
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Remove password from response
    const { password: _, ...employeeResponse } = updatedEmployee;
    
    res.json(employeeResponse);
  } catch (error) {
    console.error('Error updating HQ employee:', error);
    res.status(500).json({ message: 'Failed to update HQ employee' });
  }
});

// Deactivate HQ employee
router.post('/hq/employees/:employeeId/deactivate', requirePermission([PERMISSIONS.HR_EMPLOYEE_DELETE]), async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    
    // Prevent self-deactivation
    if (req.user.employeeId === employeeId) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }
    
    const updatedEmployee = await storage.updateHQEmployee(employeeId, {
      isActive: false,
      updatedAt: new Date(),
    });
    
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating HQ employee:', error);
    res.status(500).json({ message: 'Failed to deactivate HQ employee' });
  }
});

// Reset HQ employee password
router.post('/hq/employees/:employeeId/reset-password', requirePermission([PERMISSIONS.HR_EMPLOYEE_EDIT]), async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatedEmployee = await storage.updateHQEmployee(employeeId, {
      password: hashedPassword,
      updatedAt: new Date(),
    });
    
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// ===============================
// TENANT HR MANAGEMENT (Motor Carrier Companies)
// ===============================

// Get Gusto integration status
router.get('/tenant/gusto/integration', requireAuth, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const integration = await storage.getGustoIntegration(companyId);
    
    if (!integration) {
      return res.json({ 
        connected: false, 
        message: 'Gusto integration not configured' 
      });
    }
    
    res.json({
      connected: true,
      companyId: integration.gustoCompanyId,
      lastSync: integration.lastSync,
      employees: integration.employeeCount || 0
    });
  } catch (error) {
    console.error('Error getting Gusto integration:', error);
    res.status(500).json({ message: 'Failed to get Gusto integration status' });
  }
});

// Initialize Gusto integration
router.post('/tenant/gusto/integration/initialize', async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Create initial Gusto integration record
    const integration = await storage.createGustoIntegration({
      companyId,
      gustoCompanyId: `gusto_${companyId}`,
      accessToken: process.env.GUSTO_ACCESS_TOKEN || 'demo_token',
      refreshToken: process.env.GUSTO_REFRESH_TOKEN || 'demo_refresh',
      tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      lastSync: new Date(),
      employeeCount: 0
    });
    
    res.json({
      success: true,
      message: 'Gusto integration initialized',
      integration
    });
  } catch (error) {
    console.error('Error initializing Gusto integration:', error);
    res.status(500).json({ message: 'Failed to initialize Gusto integration' });
  }
});

// ===============================
// TENANT HR MANAGEMENT (Motor Carrier Companies)
// ===============================

// Driver Application Management
router.post('/tenant/applications', requireAuth, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const tenstreetService = createTenStreetService(companyId);
    
    const applicationData = {
      ...req.body,
      companyId,
      applicationDate: new Date(),
      applicationStatus: 'submitted',
    };
    
    const application = await tenstreetService.createDriverApplication(applicationData);
    
    res.status(201).json(application);
  } catch (error) {
    console.error('Error creating driver application:', error);
    res.status(500).json({ message: 'Failed to create driver application' });
  }
});

// Get driver applications
router.get('/tenant/applications', requireAuth, async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { status, limit = 50, offset = 0 } = req.query;
    
    const applications = await storage.getDriverApplications(companyId, {
      status,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching driver applications:', error);
    res.status(500).json({ message: 'Failed to fetch driver applications' });
  }
});

// Get specific driver application
router.get('/tenant/applications/:applicationId', async (req: any, res) => {
  try {
    const { applicationId } = req.params;
    const companyId = req.user.companyId;
    
    const application = await storage.getDriverApplication(applicationId, companyId);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    console.error('Error fetching driver application:', error);
    res.status(500).json({ message: 'Failed to fetch driver application' });
  }
});

// Update application status
router.patch('/tenant/applications/:applicationId/status', async (req: any, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    const companyId = req.user.companyId;
    
    const tenstreetService = createTenStreetService(companyId);
    
    await tenstreetService.updateApplicationStatus(applicationId, status);
    
    // Update in database
    const updatedApplication = await storage.updateDriverApplication(applicationId, {
      applicationStatus: status,
      notes,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    });
    
    res.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
});

// Order background checks
router.post('/tenant/applications/:applicationId/background-checks', async (req: any, res) => {
  try {
    const { applicationId } = req.params;
    const { checkTypes } = req.body; // ['PSP', 'MVR', 'CDLIS', 'drug_screen']
    const companyId = req.user.companyId;
    
    const tenstreetService = createTenStreetService(companyId);
    const application = await storage.getDriverApplication(applicationId, companyId);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const backgroundChecks = [];
    
    for (const checkType of checkTypes) {
      let result;
      switch (checkType) {
        case 'PSP':
          result = await tenstreetService.orderPSPReport(application);
          break;
        case 'MVR':
          result = await tenstreetService.orderMVRReport(application);
          break;
        case 'CDLIS':
          result = await tenstreetService.orderCDLISCheck(application);
          break;
        case 'drug_screen':
          await tenstreetService.scheduleDrugScreen(application);
          result = { message: 'Drug screen scheduled' };
          break;
      }
      
      backgroundChecks.push({
        checkType,
        result,
        orderedAt: new Date(),
      });
    }
    
    res.json({ backgroundChecks });
  } catch (error) {
    console.error('Error ordering background checks:', error);
    res.status(500).json({ message: 'Failed to order background checks' });
  }
});

// ===============================
// GUSTO INTEGRATION - TENANT PAYROLL
// ===============================

// Initialize Gusto integration
router.post('/tenant/gusto/setup', async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const { gustoCompanyId, accessToken, refreshToken } = req.body;
    
    // Store Gusto integration data
    const integrationData = {
      companyId,
      gustoCompanyId,
      accessToken,
      refreshToken,
      tokenExpiry: new Date(Date.now() + 7200000), // 2 hours
      syncStatus: 'active',
      enabledFeatures: ['employee_sync', 'payroll_sync', 'benefits_sync'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await storage.createGustoIntegration(integrationData);
    
    res.json({ message: 'Gusto integration initialized successfully' });
  } catch (error) {
    console.error('Error setting up Gusto integration:', error);
    res.status(500).json({ message: 'Failed to set up Gusto integration' });
  }
});

// Sync employees with Gusto
router.post('/tenant/gusto/sync-employees', async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const integration = await storage.getGustoIntegration(companyId);
    
    if (!integration) {
      return res.status(404).json({ message: 'Gusto integration not found' });
    }
    
    // Get employees from Gusto
    const gustoEmployees = await gustoService.getCompanyEmployees(integration.gustoCompanyId);
    
    const syncResults = [];
    
    for (const gustoEmployee of gustoEmployees) {
      try {
        await gustoService.syncEmployeeToFreightOps(companyId, gustoEmployee);
        syncResults.push({
          employeeId: gustoEmployee.id,
          name: `${gustoEmployee.first_name} ${gustoEmployee.last_name}`,
          status: 'synced',
        });
      } catch (error) {
        syncResults.push({
          employeeId: gustoEmployee.id,
          name: `${gustoEmployee.first_name} ${gustoEmployee.last_name}`,
          status: 'error',
          error: error.message,
        });
      }
    }
    
    // Update last sync date
    await storage.updateGustoIntegration(companyId, {
      lastSyncDate: new Date(),
      syncStatus: 'active',
    });
    
    res.json({ syncResults });
  } catch (error) {
    console.error('Error syncing employees with Gusto:', error);
    res.status(500).json({ message: 'Failed to sync employees with Gusto' });
  }
});

// Create employee in Gusto
router.post('/tenant/gusto/employees', async (req: any, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    let integration = await storage.getGustoIntegration(companyId);
    
    if (!integration) {
      // Auto-initialize integration if not exists
      integration = await storage.createGustoIntegration({
        companyId,
        gustoCompanyId: `gusto_${companyId}`,
        accessToken: process.env.GUSTO_ACCESS_TOKEN || 'demo_token',
        refreshToken: process.env.GUSTO_REFRESH_TOKEN || 'demo_refresh',
        tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        lastSync: new Date(),
        employeeCount: 0
      });
    }
    
    const employeeData = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      date_of_birth: req.body.dateOfBirth,
      ssn: req.body.ssn,
      start_date: req.body.startDate,
      home_address: req.body.homeAddress,
    };
    
    const gustoEmployee = await gustoService.createEmployee(integration.gustoCompanyId, employeeData);
    
    // Create job and compensation
    if (req.body.jobData) {
      const job = await gustoService.createJob(integration.gustoCompanyId, {
        ...req.body.jobData,
        employee_id: gustoEmployee.id,
      });
      
      if (req.body.compensationData) {
        await gustoService.createCompensation(job.id, req.body.compensationData);
      }
    }
    
    res.status(201).json(gustoEmployee);
  } catch (error) {
    console.error('Error creating employee in Gusto:', error);
    res.status(500).json({ message: 'Failed to create employee in Gusto' });
  }
});

// Get Gusto payrolls
router.get('/tenant/gusto/payrolls', async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const integration = await storage.getGustoIntegration(companyId);
    
    if (!integration) {
      return res.status(404).json({ message: 'Gusto integration not found' });
    }
    
    const payrolls = await gustoService.getCompanyPayrolls(integration.gustoCompanyId, req.query);
    
    res.json({ payrolls });
  } catch (error) {
    console.error('Error fetching Gusto payrolls:', error);
    res.status(500).json({ message: 'Failed to fetch Gusto payrolls' });
  }
});

// Create payroll in Gusto
router.post('/tenant/gusto/payrolls', async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const integration = await storage.getGustoIntegration(companyId);
    
    if (!integration) {
      return res.status(404).json({ message: 'Gusto integration not found' });
    }
    
    const payrollData = {
      start_date: req.body.startDate,
      end_date: req.body.endDate,
      check_date: req.body.checkDate,
    };
    
    const payroll = await gustoService.createPayroll(integration.gustoCompanyId, payrollData);
    
    res.status(201).json(payroll);
  } catch (error) {
    console.error('Error creating payroll in Gusto:', error);
    res.status(500).json({ message: 'Failed to create payroll in Gusto' });
  }
});

// Submit payroll in Gusto
router.post('/tenant/gusto/payrolls/:payrollId/submit', async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const { payrollId } = req.params;
    const integration = await storage.getGustoIntegration(companyId);
    
    if (!integration) {
      return res.status(404).json({ message: 'Gusto integration not found' });
    }
    
    const payroll = await gustoService.submitPayroll(integration.gustoCompanyId, payrollId);
    
    res.json(payroll);
  } catch (error) {
    console.error('Error submitting payroll in Gusto:', error);
    res.status(500).json({ message: 'Failed to submit payroll in Gusto' });
  }
});

// Get employee benefits
router.get('/tenant/gusto/employees/:employeeId/benefits', async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    const benefits = await gustoService.getEmployeeBenefits(employeeId);
    
    res.json({ benefits });
  } catch (error) {
    console.error('Error fetching employee benefits:', error);
    res.status(500).json({ message: 'Failed to fetch employee benefits' });
  }
});

// Enroll employee in benefits
router.post('/tenant/gusto/employees/:employeeId/benefits', async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    const benefitData = req.body;
    
    const enrollment = await gustoService.enrollEmployeeInBenefit(employeeId, benefitData);
    
    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error enrolling employee in benefits:', error);
    res.status(500).json({ message: 'Failed to enroll employee in benefits' });
  }
});

// ===============================
// ONBOARDING WORKFLOWS
// ===============================

// Start onboarding process
router.post('/tenant/onboarding/start/:applicationId', async (req: any, res) => {
  try {
    const { applicationId } = req.params;
    const companyId = req.user.companyId;
    
    const tenstreetService = createTenStreetService(companyId);
    await tenstreetService.initiateOnboarding(applicationId);
    
    res.json({ message: 'Onboarding process started' });
  } catch (error) {
    console.error('Error starting onboarding:', error);
    res.status(500).json({ message: 'Failed to start onboarding process' });
  }
});

// Complete onboarding step
router.post('/tenant/onboarding/:applicationId/complete-step', async (req: any, res) => {
  try {
    const { applicationId } = req.params;
    const { step } = req.body;
    const companyId = req.user.companyId;
    
    const tenstreetService = createTenStreetService(companyId);
    await tenstreetService.completeOnboardingStep(applicationId, step);
    
    res.json({ message: 'Onboarding step completed' });
  } catch (error) {
    console.error('Error completing onboarding step:', error);
    res.status(500).json({ message: 'Failed to complete onboarding step' });
  }
});

// Get onboarding status
router.get('/tenant/onboarding/:applicationId/status', async (req: any, res) => {
  try {
    const { applicationId } = req.params;
    const companyId = req.user.companyId;
    
    const onboardingStatus = await storage.getOnboardingStatus(applicationId, companyId);
    
    res.json(onboardingStatus);
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    res.status(500).json({ message: 'Failed to fetch onboarding status' });
  }
});

// ===============================
// DOCUMENT MANAGEMENT
// ===============================

// Upload employee document
router.post('/tenant/employees/:employeeId/documents', async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    const companyId = req.user.companyId;
    
    // Handle file upload (would integrate with actual file storage)
    const documentData = {
      employeeId,
      companyId,
      documentType: req.body.documentType,
      documentCategory: req.body.documentCategory,
      documentName: req.body.documentName,
      fileName: req.body.fileName,
      fileUrl: req.body.fileUrl,
      expirationDate: req.body.expirationDate,
      uploadedBy: req.user.id,
      createdAt: new Date(),
    };
    
    const document = await storage.createEmployeeDocument(documentData);
    
    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading employee document:', error);
    res.status(500).json({ message: 'Failed to upload employee document' });
  }
});

// Get employee documents
router.get('/tenant/employees/:employeeId/documents', async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    const companyId = req.user.companyId;
    
    const documents = await storage.getEmployeeDocuments(employeeId, companyId);
    
    res.json({ documents });
  } catch (error) {
    console.error('Error fetching employee documents:', error);
    res.status(500).json({ message: 'Failed to fetch employee documents' });
  }
});

// Check DOT compliance
router.get('/tenant/employees/:employeeId/dot-compliance', async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    const companyId = req.user.companyId;
    
    const tenstreetService = createTenStreetService(companyId);
    const compliance = await tenstreetService.checkDOTCompliance(employeeId);
    
    res.json(compliance);
  } catch (error) {
    console.error('Error checking DOT compliance:', error);
    res.status(500).json({ message: 'Failed to check DOT compliance' });
  }
});

export default router;