# Replit Secrets Update for New OAuth Client

## Required Secret Updates

You need to update these Replit environment secrets to match your new OAuth client:

### 1. RAILSR_CLIENT_ID
```
a17dsyuxxb1m@686f333e-3889-4361-a12e-e2ba0513c688.play.railsbank.com
```

### 2. RAILSR_KEY_ID
```
463d33f0-6513-4769-8cbb-b7cde77b935b
```

### 3. RAILSR_PRIVATE_KEY_COMPLETE
```json
{"kty":"EC","crv":"P-256","x":"2osq6v-NwVeTDwo-1tFUjVVM2GxYI1xljRxlkb4BR14","y":"oy6x1NlWsu7jldB2H6G5hzbfq4f4Az4M0yF5eLnFkTs","d":"9UPFBIs6f6SP_a3GXdyE58XS9y6sx9smlOFrIFlgb_8","use":"sig","alg":"ES256","kid":"463d33f0-6513-4769-8cbb-b7cde77b935b"}
```

## How to Update in Replit

1. **Open Secrets Tab**: Click the lock icon in the Replit sidebar
2. **Find Each Secret**: Locate the three secrets listed above
3. **Update Values**: Replace the current values with the new ones above
4. **Restart Server**: Restart the workflow to apply changes

## Verification

After updating the secrets, test with:
```bash
curl -X GET "http://localhost:5000/api/railsr/test-connection"
curl -X GET "http://localhost:5000/api/railsr/customer"
```

You should see successful authentication instead of 403 responses.

## Expected Results

- Connection test: `{"connected":true}` with new client ID
- Customer API: Real customer data instead of authentication errors
- JWT tokens: Generated with new key pair matching your OAuth client

## Notes

- The private key contains the 'd' property needed for JWT signing
- Key ID must match between public and private keys
- All values are specific to your new OAuth client: a17dsyuxxb1m