/**
 * Railsr API Routes
 * Complete API endpoints for Railsr Banking-as-a-Service integration
 * Based on official Railsr documentation
 */

import { Router } from 'express';
import { RailsrIntegration } from '../services/railsr-integration';

const router = Router();
const railsrIntegration = new RailsrIntegration();

/**
 * Test Railsr connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    const connection = await railsrIntegration.testConnection();
    res.json(connection);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get customer details
 */
router.get('/customer', async (req, res) => {
  try {
    const customer = await railsrIntegration.getCustomerDetails();
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Initialize company banking
 */
router.post('/companies/:companyId/banking/initialize', async (req, res) => {
  try {
    const { companyId } = req.params;
    const banking = await railsrIntegration.initializeCompanyBanking(companyId);
    res.json(banking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create driver card
 */
router.post('/companies/:companyId/drivers/:driverId/card', async (req, res) => {
  try {
    const { companyId, driverId } = req.params;
    const card = await railsrIntegration.createDriverCard(driverId, companyId);
    res.json(card);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Process vendor payment
 */
router.post('/companies/:companyId/payments/vendor', async (req, res) => {
  try {
    const { companyId } = req.params;
    const paymentData = req.body;
    const payment = await railsrIntegration.processVendorPayment(companyId, paymentData);
    res.json(payment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get account balance
 */
router.get('/companies/:companyId/balance', async (req, res) => {
  try {
    const { companyId } = req.params;
    const balance = await railsrIntegration.getAccountBalance(companyId);
    res.json(balance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get transaction history
 */
router.get('/companies/:companyId/transactions', async (req, res) => {
  try {
    const { companyId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await railsrIntegration.getTransactionHistory(companyId, limit);
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Setup webhooks
 */
router.post('/companies/:companyId/webhooks/setup', async (req, res) => {
  try {
    const { companyId } = req.params;
    const webhooks = await railsrIntegration.setupWebhooks(companyId);
    res.json(webhooks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Exchange currency
 */
router.post('/companies/:companyId/fx/exchange', async (req, res) => {
  try {
    const { companyId } = req.params;
    const exchangeData = req.body;
    const exchange = await railsrIntegration.exchangeCurrency(companyId, exchangeData);
    res.json(exchange);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Handle Railsr webhooks
 */
router.post('/webhooks/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const webhookData = req.body;
    
    // Log webhook event
    console.log(`Railsr webhook received for company ${companyId}:`, webhookData);
    
    // Process webhook based on event type
    switch (webhookData.type) {
      case 'transaction.created':
        // Handle new transaction
        console.log('New transaction:', webhookData.data);
        break;
      case 'transaction.completed':
        // Handle completed transaction
        console.log('Transaction completed:', webhookData.data);
        break;
      case 'transaction.failed':
        // Handle failed transaction
        console.log('Transaction failed:', webhookData.data);
        break;
      case 'account.created':
        // Handle new account
        console.log('Account created:', webhookData.data);
        break;
      case 'card.created':
        // Handle new card
        console.log('Card created:', webhookData.data);
        break;
      default:
        console.log('Unknown webhook event:', webhookData.type);
    }
    
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;