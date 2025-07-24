import { Router, Request, Response } from "express";
import { quickBooksAccountingService } from "./quickbooks-accounting-service";
import { z } from "zod";

const router = Router();

// Middleware to ensure user is authenticated and has accounting access
const requireAccountingAccess = (req: Request, res: Response, next: any) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (!['admin', 'accounting'].includes(user.role)) {
    return res.status(403).json({ error: "Insufficient permissions for accounting access" });
  }
  
  next();
};

// Dashboard and Summary
router.get("/dashboard", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    if (!companyId) {
      return res.status(400).json({ error: "Company ID required" });
    }

    const summary = await quickBooksAccountingService.getDashboardSummary(companyId);
    res.json(summary);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Chart of Accounts
router.get("/chart-of-accounts", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const accounts = await quickBooksAccountingService.getChartOfAccounts(companyId);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chart of accounts" });
  }
});

router.post("/chart-of-accounts", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const accountData = { ...req.body, companyId };
    const account = await quickBooksAccountingService.createAccount(accountData);
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Invoice Management
router.get("/invoices", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const filters = {
      status: req.query.status as string,
      customerId: req.query.customerId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };
    
    const invoices = await quickBooksAccountingService.getInvoices(companyId, filters);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

router.post("/invoices", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const invoiceData = { ...req.body, companyId };
    const result = await quickBooksAccountingService.createInvoice(invoiceData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

router.patch("/invoices/:id/status", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, amountPaid } = req.body;
    const invoice = await quickBooksAccountingService.updateInvoiceStatus(id, status, amountPaid);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to update invoice status" });
  }
});

// Bill Management
router.get("/bills", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const filters = {
      status: req.query.status as string,
      vendorId: req.query.vendorId as string,
      approvalStatus: req.query.approvalStatus as string
    };
    
    const bills = await quickBooksAccountingService.getBills(companyId, filters);
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
});

router.post("/bills", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const billData = { ...req.body, companyId };
    const result = await quickBooksAccountingService.createBill(billData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to create bill" });
  }
});

router.patch("/bills/:id/approve", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const approvedBy = (req as any).user?.id;
    const bill = await quickBooksAccountingService.approveBill(id, approvedBy);
    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: "Failed to approve bill" });
  }
});

// Payment Management
router.get("/payments", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const filters = {
      type: req.query.type as string,
      paymentMethod: req.query.paymentMethod as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    };
    
    const payments = await quickBooksAccountingService.getPayments(companyId, filters);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

router.post("/payments", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const paymentData = { ...req.body, companyId };
    const result = await quickBooksAccountingService.recordPayment(paymentData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to record payment" });
  }
});

// Bank Transaction Matching
router.post("/bank-transactions/:id/match", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req as any).user?.companyId;
    const { matchedType, matchedId, matchAmount, confidence } = req.body;
    
    await quickBooksAccountingService.matchBankTransaction(
      companyId, id, matchedType, matchedId, matchAmount, confidence
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to match bank transaction" });
  }
});

// Financial Reports
router.get("/reports/profit-loss", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const startDate = req.query.startDate as string || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = req.query.endDate as string || new Date().toISOString().split('T')[0];
    
    const report = await quickBooksAccountingService.getProfitLossReport(companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate P&L report" });
  }
});

router.get("/reports/balance-sheet", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const asOfDate = req.query.asOfDate as string || new Date().toISOString().split('T')[0];
    
    const report = await quickBooksAccountingService.getBalanceSheet(companyId, asOfDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate balance sheet" });
  }
});

router.get("/reports/ar-aging", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const report = await quickBooksAccountingService.getARAgingReport(companyId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate AR aging report" });
  }
});

// Export endpoints (PDF/CSV generation)
router.get("/export-pnl", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const startDate = req.query.startDate as string || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = req.query.endDate as string || new Date().toISOString().split('T')[0];
    
    const report = await quickBooksAccountingService.getProfitLossReport(companyId, startDate, endDate);
    
    // Generate PDF content
    const pdfContent = generatePnLPDF(report);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="profit-loss-${startDate}-to-${endDate}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({ error: "Failed to export P&L report" });
  }
});

router.get("/export-balance-sheet", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const asOfDate = req.query.asOfDate as string || new Date().toISOString().split('T')[0];
    
    const report = await quickBooksAccountingService.getBalanceSheet(companyId, asOfDate);
    
    const pdfContent = generateBalanceSheetPDF(report);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="balance-sheet-${asOfDate}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({ error: "Failed to export balance sheet" });
  }
});

router.get("/export-invoices", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const invoices = await quickBooksAccountingService.getInvoices(companyId);
    
    const csvContent = generateInvoicesCSV(invoices);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="invoices-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: "Failed to export invoices" });
  }
});

// Recurring Transactions
router.post("/recurring-transactions", requireAccountingAccess, async (req: Request, res: Response) => {
  try {
    const companyId = (req as any).user?.companyId;
    const { templateName, transactionType, frequency, templateData } = req.body;
    
    await quickBooksAccountingService.createRecurringTransaction(
      companyId, templateName, transactionType, frequency, templateData
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create recurring transaction" });
  }
});

// Process recurring transactions (cron job endpoint)
router.post("/process-recurring", async (req: Request, res: Response) => {
  try {
    await quickBooksAccountingService.processRecurringTransactions();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to process recurring transactions" });
  }
});

// Utility functions for PDF/CSV generation
function generatePnLPDF(report: any): Buffer {
  // Simple PDF generation - in production, use a proper PDF library like PDFKit
  const content = `
PROFIT & LOSS STATEMENT
Period: ${report.period.startDate} to ${report.period.endDate}

REVENUE: $${report.revenue.toLocaleString()}
EXPENSES: $${report.expenses.toLocaleString()}
NET INCOME: $${report.netIncome.toLocaleString()}
  `;
  
  return Buffer.from(content);
}

function generateBalanceSheetPDF(report: any): Buffer {
  const content = `
BALANCE SHEET
As of: ${report.asOfDate}

ASSETS: $${report.assets.total.toLocaleString()}
LIABILITIES: $${report.liabilities.total.toLocaleString()}
EQUITY: $${report.equity.total.toLocaleString()}
  `;
  
  return Buffer.from(content);
}

function generateInvoicesCSV(invoices: any[]): string {
  const headers = ['Invoice Number', 'Customer', 'Amount', 'Status', 'Due Date'];
  const rows = invoices.map(inv => [
    inv.invoiceNumber,
    inv.customerName || '',
    inv.totalAmount,
    inv.status,
    inv.dueDate
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export default router;