# Railsr Sandbox Setup Guide

## Complete Step-by-Step Instructions for Setting Up Railsr Banking Integration

✅ **UPDATED WITH CORRECT SCOPES**: This guide now includes the actual OAuth scopes from the Railsr dashboard. The scopes have been verified and are current as of the latest Railsr API documentation.

### 1. Create Railsr Account and Access Dashboard

1. **Go to Railsr Dashboard**
   - Visit: https://dashboard.railsr.com
   - Click "Sign Up" or "Get Started"
   - Complete the registration process

2. **Access Your Dashboard**
   - Log in to your Railsr account
   - You'll see the main dashboard with navigation on the left

### 2. Create OAuth Client (Required for JWT Authentication)

1. **Navigate to OAuth Clients**
   - In the left sidebar, click "For Developers"
   - Select "OAuth Clients" from the dropdown menu

2. **Create New OAuth Client**
   - Click "Create new OAuth client" button
   - Fill in the form:
     - **Environment**: Select "Play" (for sandbox testing)
     - **Name**: Enter "FreightOps Pro Banking Integration"
     - **Scopes**: Select the appropriate scopes for FreightOps Pro banking integration:
       **Core Banking Scopes (Required):**
       ```
       um/railsr/api_keys
       um/railsr/beneficiaries
       um/railsr/cards
       um/railsr/customer/info
       um/railsr/debts
       um/railsr/endusers
       um/railsr/fx
       um/railsr/ledgers
       um/railsr/transactions
       ```
       
       **Additional Scopes (Recommended):**
       ```
       um/railsr/cards/payment_tokens
       um/railsr/cards/programmes
       um/railsr/compliance
       um/railsr/endusers/agreements
       um/railsr/endusers/kyc
       um/railsr/notifications
       um/railsr/open_banking/consents
       ```
       
       **For Full Banking Features:**
       - Copy all scopes from the dropdown in your Railsr dashboard
       - Each scope should be space-separated in the final scope string

3. **Generate JWK Key Pair**
   - You need to generate a JSON Web Key (JWK) pair for authentication
   - Use https://jwkset.com/generate to create keys
   - Select "ECDSA P-256" algorithm
   - Copy the **PUBLIC KEY** (you'll paste this in Railsr)
   - Save the **PRIVATE KEY** (you'll use this in your environment variables)

4. **Complete OAuth Client Setup**
   - **JWK Public Key**: Paste the public key from step 3
   - Click "Create OAuth Client"
   - **IMPORTANT**: Copy the generated **Client ID** - you'll need this

### 3. Set Up Environment Variables

Add these environment variables to your `.env` file:

```env
# Railsr Configuration
RAILSR_CLIENT_ID=your_client_id_from_step_2
RAILSR_PRIVATE_KEY=your_private_key_from_jwkset
RAILSR_ALGORITHM=ES256
RAILSR_BASE_URL=https://play.railsbank.com/v1
RAILSR_ENVIRONMENT=play
RAILSR_SCOPES=um/railsr/api_keys um/railsr/beneficiaries um/railsr/cards um/railsr/customer/info um/railsr/debts um/railsr/endusers um/railsr/fx um/railsr/ledgers um/railsr/transactions um/railsr/cards/payment_tokens um/railsr/cards/programmes um/railsr/compliance um/railsr/endusers/agreements um/railsr/endusers/kyc um/railsr/notifications um/railsr/open_banking/consents
```

**Note:** The scopes are space-separated as shown above. You can add or remove scopes based on your specific needs. The core banking scopes (api_keys, beneficiaries, cards, customer/info, debts, endusers, fx, ledgers, transactions) are required for basic banking functionality.

### 4. Test the Integration

1. **Run the Test Script**
   ```bash
   node test-railsr-integration.js
   ```

2. **Expected Output**
   - ✅ JWT Authentication successful
   - ✅ Customer details retrieved
   - ✅ Enduser created
   - ✅ Ledger created
   - ✅ Card created
   - ✅ Beneficiary created
   - ✅ Webhook setup successful

### 5. Using the Banking Features

Once set up, FreightOps Pro will have these capabilities:

#### **Company Banking Initialization**
```javascript
// Automatically creates:
// - Railsr enduser for the company
// - USD ledger for business transactions
// - Bank account numbers for ACH/wire transfers
```

#### **Driver Corporate Cards**
```javascript
// Creates virtual/physical cards for drivers
// - Linked to company ledger
// - Expense tracking and limits
// - Real-time transaction monitoring
```

#### **Payment Processing**
```javascript
// Vendor payments via ACH/wire
// - Automatic beneficiary creation
// - Payment processing with tracking
// - Transaction history and reporting
```

#### **Account Management**
```javascript
// Real-time account balances
// - Transaction history
// - Webhook notifications
// - Currency exchange capabilities
```

### 6. API Endpoints Available

Your FreightOps Pro will have these API endpoints:

```bash
# Test connection
GET /api/railsr/test-connection

# Get customer details
GET /api/railsr/customer

# Initialize company banking
POST /api/railsr/companies/:companyId/banking/initialize

# Create driver card
POST /api/railsr/companies/:companyId/drivers/:driverId/card

# Process vendor payment
POST /api/railsr/companies/:companyId/payments/vendor

# Get account balance
GET /api/railsr/companies/:companyId/balance

# Get transaction history
GET /api/railsr/companies/:companyId/transactions

# Setup webhooks
POST /api/railsr/companies/:companyId/webhooks/setup

# Currency exchange
POST /api/railsr/companies/:companyId/fx/exchange
```

### 7. Webhook Configuration

1. **Set Webhook URL**
   - In Railsr dashboard, go to "Webhooks"
   - Add webhook endpoint: `https://your-domain.replit.app/api/railsr/webhooks/:companyId`
   - Select events: transactions, cards, accounts

2. **Test Webhook Reception**
   - Perform a test transaction
   - Check your application logs for webhook events

### 8. Production Deployment

When ready for production:

1. **Switch to Live Environment**
   - Change `RAILSR_ENVIRONMENT` to `live`
   - Update `RAILSR_BASE_URL` to `https://live.railsr.com/v1`
   - Create new OAuth client in "Live" environment

2. **Update Compliance**
   - Complete KYC/AML verification
   - Submit required business documentation
   - Meet regulatory requirements

### 9. Troubleshooting

#### **Common Issues:**

**JWT Authentication Fails**
- Verify your private key format
- Check client ID matches exactly
- Ensure scopes are correctly formatted

**API Calls Return 401**
- Check if access token is expired
- Verify Bearer token is included in headers
- Confirm OAuth client has required scopes

**Webhook Not Received**
- Verify webhook URL is publicly accessible
- Check firewall/security group settings
- Confirm webhook endpoint is correctly configured

#### **Debug Mode**
Enable detailed logging by setting:
```env
DEBUG=railsr:*
```

### 10. Support and Resources

- **Railsr Documentation**: https://docs.railsr.com
- **API Reference**: https://docs.railsr.com/reference
- **Support**: Contact Railsr support through dashboard
- **JWT Generator**: https://jwkset.com/generate

---

## Next Steps After Setup

1. Test the integration with a freight company
2. Create driver cards for expense management
3. Set up vendor payment workflows
4. Configure webhook monitoring
5. Implement transaction reporting
6. Add currency exchange features for international freight

Your FreightOps Pro platform will now have enterprise-grade banking capabilities powered by Railsr's Banking-as-a-Service platform!