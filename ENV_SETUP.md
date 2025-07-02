# Environment Setup Guide

## Quick Setup

### Option 1: Use the setup script (Recommended)
```bash
./setup.sh
```

### Option 2: Manual setup
1. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit the `.env.local` file with your values:
   ```bash
   nano .env.local  # or use your preferred editor
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

### Required Variables
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:3001/api` | `https://api.yourapp.com/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `http://localhost:3001` | `https://api.yourapp.com` |
| `NODE_ENV` | Environment mode | `development` | `production` |

### Optional Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | `https://...@sentry.io/...` |
| `NEXT_PUBLIC_HOTJAR_ID` | Hotjar analytics ID | `1234567` |

## Environment Files

Next.js supports multiple environment files:

- `.env.local` - Local development (ignored by git)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env` - Default for all environments

## Production Setup

For production deployment, set these environment variables in your hosting platform:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
NEXT_PUBLIC_WS_URL=https://your-api-domain.com
NODE_ENV=production
```

## Security Notes

- ⚠️ **All `NEXT_PUBLIC_` variables are exposed to the browser**
- ⚠️ **Never put secrets in `NEXT_PUBLIC_` variables**
- ✅ Use server-side API routes for sensitive operations
- ✅ Validate all environment variables at build time
