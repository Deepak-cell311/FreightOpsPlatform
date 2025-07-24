# FreightOps Pro - Vercel Deployment Guide

## Quick Deploy

1. **Connect to Vercel**
   - Import your repository to Vercel
   - Set build command: `npm run vercel-build`
   - Set output directory: `dist`

2. **Environment Variables**
   ```
   DATABASE_URL=your_neon_database_url
   SESSION_SECRET=your_session_secret
   STRIPE_SECRET_KEY=sk_...
   VITE_STRIPE_PUBLIC_KEY=pk_...
   OPENAI_API_KEY=your_openai_key
   GUSTO_CLIENT_ID=your_gusto_client_id
   GUSTO_CLIENT_SECRET=your_gusto_secret
   GUSTO_REDIRECT_URI=https://your-domain.vercel.app/auth/gusto/callback
   VITE_GOOGLE_MAPS_API_KEY=your_maps_key
   NODE_ENV=production
   ```

3. **Deploy**
   - Click "Deploy" in Vercel dashboard
   - System will automatically build and deploy

## Configuration Files

- `vercel.json` - Deployment configuration
- `tsconfig.server.json` - Server TypeScript config
- `.vercelignore` - Files to exclude from deployment
- `api/index.ts` - Serverless function entry point

## Production Features

✓ Serverless API routes via Vercel Functions
✓ Static asset optimization and CDN delivery
✓ Automatic HTTPS and custom domain support
✓ Environment variable management
✓ Build optimization with code splitting
✓ Production database integration
✓ Session management with secure cookies

## Post-Deployment

1. Test all API endpoints
2. Verify database connectivity
3. Check external service integrations
4. Monitor performance and errors

The system is production-ready for customer registrations with zero mock data and full Vercel compatibility.