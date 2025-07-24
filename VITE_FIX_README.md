# CRITICAL VITE FIX - DO NOT REMOVE

## Problem
Vite middleware intercepts API routes in development mode, causing all API calls to return HTML instead of JSON. This breaks authentication and all frontend functionality.

## Solution
The `api-middleware.ts` file contains a critical fix that must remain in place:

1. **API Route Guard**: Prevents Vite from intercepting `/api/*` and `/hq/api/*` routes
2. **Response Override**: Ensures JSON responses aren't converted to HTML by Vite
3. **Middleware Order**: Applied before Vite setup in `server/index.ts`

## Files Involved
- `server/api-middleware.ts` - Contains the fix (DO NOT MODIFY)
- `server/index.ts` - Applies the middleware (line 79)

## Symptoms of Missing Fix
- API calls return HTML instead of JSON
- Authentication fails with 401 errors
- Dashboard pages appear blank
- All frontend functionality breaks

## Testing the Fix
```bash
# Should return JSON user data, not HTML
curl -X GET http://localhost:5000/api/auth/user

# Should return JSON login response, not HTML  
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

## Backup Implementation
If the fix is accidentally removed, restore it by:

1. Recreating `server/api-middleware.ts` with the `createAPIRouteGuard()` function
2. Adding `app.use(createAPIRouteGuard());` before Vite setup in `server/index.ts`
3. Ensuring the middleware runs before any Vite middleware

**NEVER REMOVE THIS FIX - IT'S ESSENTIAL FOR API FUNCTIONALITY**