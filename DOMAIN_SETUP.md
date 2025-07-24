# Custom Domain Setup for FreightOps Pro

## Overview
To change from freightopspro.replit.app to your own custom domain, you'll configure Replit Deployments to serve your application on your domain.

## Prerequisites
- A domain name that you own (e.g., yourcompany.com)
- Access to your domain's DNS settings (GoDaddy, Namecheap, Cloudflare, etc.)
- Replit Pro subscription (required for custom domains)

## Quick Setup Summary
1. Deploy your application in Replit
2. Add your custom domain in Replit's deployment settings
3. Update your domain's DNS records
4. Wait for SSL certificate provisioning
5. Optionally set CUSTOM_DOMAIN environment variable

## Step 1: Deploy Your Application
1. Click the "Deploy" button in Replit
2. Choose "Autoscale Deployment" for production use
3. Wait for the initial deployment to complete

## Step 2: Configure Custom Domain in Replit
1. Go to your Replit deployment dashboard
2. Click on "Domains" in the left sidebar
3. Click "Add Custom Domain"
4. Enter your domain name (e.g., yourdomain.com)

## Step 3: Update DNS Records
Add these DNS records to your domain provider:

### For Apex Domain (yourdomain.com):
```
Type: A
Name: @
Value: [IP provided by Replit]
TTL: 300
```

### For WWW Subdomain:
```
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 300
```

### For SSL Verification (if required):
```
Type: TXT
Name: _replit-challenge
Value: [Token provided by Replit]
TTL: 300
```

## Step 4: SSL Certificate
Replit automatically provisions SSL certificates using Let's Encrypt once DNS verification is complete.

## Step 5: Environment Configuration (Optional)
Once your custom domain is working, you can optionally set an environment variable to let the application know about your custom domain:

1. In your Replit project, go to the "Secrets" tab
2. Add a new secret:
   - Key: `CUSTOM_DOMAIN`
   - Value: your domain (e.g., `yourcompany.com`)

This helps the application generate correct URLs and handle redirects properly.

## Verification
After DNS propagation (up to 24 hours), your application will be available at:
- https://yourdomain.com
- https://www.yourdomain.com (if configured)

## Troubleshooting

### Common Issues:
1. **DNS Propagation Delay**: Wait up to 24 hours for DNS changes to propagate globally
2. **SSL Certificate Pending**: Replit will automatically retry SSL provisioning
3. **Domain Verification Failed**: Ensure DNS records are correctly configured

### Check DNS Propagation:
```bash
# Check if your domain points to Replit
nslookup yourdomain.com

# Check DNS propagation globally
dig yourdomain.com @8.8.8.8
```

## Important Notes
- Keep your current freightopspro.replit.app URL as a fallback during transition
- Monitor the deployment dashboard for any issues
- SSL certificates auto-renew every 90 days
- Domain changes may take 5-10 minutes to reflect in the Replit dashboard

## Support
If you encounter issues:
1. Check the Replit deployment logs
2. Verify DNS configuration with your domain provider
3. Contact Replit support if domain verification fails