# New Railsr OAuth Client Setup Guide

## Step 1: Create New OAuth Client in Railsr Dashboard

1. Go to your Railsr dashboard
2. Navigate to OAuth clients section
3. Click "Create New OAuth Client"
4. Fill in required details:
   - Name: FreightOps Banking Integration
   - Description: Banking-as-a-Service for FreightOps platform
   - Environment: Sandbox/Play

## Step 2: Upload Public Key

Copy and paste this exact public key in the JWK section:

```json
{"kty":"EC","crv":"P-256","x":"2osq6v-NwVeTDwo-1tFUjVVM2GxYI1xljRxlkb4BR14","y":"oy6x1NlWsu7jldB2H6G5hzbfq4f4Az4M0yF5eLnFkTs","use":"sig","alg":"ES256","kid":"463d33f0-6513-4769-8cbb-b7cde77b935b"}
```

## Step 3: Configure OAuth Scopes

Add these scopes to your OAuth client:
- um/railsr/api_keys
- um/railsr/beneficiaries
- um/railsr/cards
- um/railsr/customer/info
- um/railsr/debts
- um/railsr/endusers
- um/railsr/fx
- um/railsr/ledgers
- um/railsr/transactions
- um/railsr/cards/payment_tokens
- um/railsr/cards/programmes
- um/railsr/compliance
- um/railsr/endusers/agreements
- um/railsr/endusers/kyc
- um/railsr/notifications
- um/railsr/open_banking/consents

## Step 4: Get Client ID

After creating the OAuth client, copy the new client ID and update your environment variables.

## Step 5: Update Environment Variables

Update your .env file with the new credentials:

```bash
RAILSR_CLIENT_ID=a17dsyuxxb1m@686f333e-3889-4361-a12e-e2ba0513c688.play.railsbank.com
RAILSR_PRIVATE_KEY={"kty":"EC","crv":"P-256","x":"m0mGmKp2aNrIFv7Q5TORZcj2QQjiv3AzKuPdFl4ARTo","y":"bI6yyJh_lteax_RsSHWQgJDFeMe5chAIkrmV7jrZE8Y","d":"rFw7w6-bLR5V1prQfkg7I8wnBYwm7zb7GeWGKD0JPtA","use":"sig","alg":"ES256","kid":"482bd4eb-8b49-4ccb-8abe-4e69149a8d08"}
RAILSR_KEY_ID=482bd4eb-8b49-4ccb-8abe-4e69149a8d08
```

## Step 6: Test Connection

Run this test to verify the new OAuth client works:

```bash
curl -X GET "http://localhost:5000/api/railsr/test-connection"
```

You should see `{"connected":true}` response.

## Step 7: Test Customer API

Once authenticated, test the customer API:

```bash
curl -X GET "http://localhost:5000/api/railsr/customer"
```

You should receive customer data instead of 403 responses.

## Notes

- Keep the private key secure and never share it
- The Key ID must match between public and private keys
- Use ES256 algorithm for JWT signing
- Test in sandbox environment before production