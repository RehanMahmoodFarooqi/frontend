# Frontend Vercel Deployment Guide

This guide will help you deploy the Book Exchange frontend to Vercel.

## ⚠️ Important: Vercel Considerations

Vercel is designed for **serverless functions** and has some characteristics to be aware of:

- **10-second timeout** on Hobby plan (60s on Pro)
- **Serverless architecture** - each request handled by a separate function
- **Cold starts** - first request after inactivity may be slower
- **No persistent connections** - connections are recreated per request

**Note**: This setup will work for your Express + tRPC application, but if you need long-running processes or persistent connections, consider Railway instead.

---

## Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- Backend already deployed on Vercel
- Backend Vercel URL
- GitHub repository connected to Vercel

---

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

Ensure all your code is committed and pushed to GitHub:

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 2. Create a New Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your frontend repository
5. Click **"Import"**

### 3. Configure Project Settings

#### Framework Preset
- Select **"Other"** (not Vite - we're using custom Express server)

#### Root Directory
- Leave as `./` (default)

#### Build & Development Settings

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Output Directory** | `dist/public` |
| **Install Command** | `npm install` |
| **Development Command** | Leave empty |

### 4. Configure Environment Variables

Click **"Environment Variables"** and add the following:

#### Required Variables

```env
# API Configuration - CRITICAL
VITE_API_URL
https://your-backend.vercel.app
```
**Important**: Replace with your actual backend Vercel URL (no trailing slash)

```env
# Node Environment
NODE_ENV
production
```

```env
# Server Port (automatically set by Vercel, but can be specified)
PORT
3000
```

#### Database Variables (if your frontend uses database)

```env
# Database URL
DATABASE_URL
mysql://user:password@host:3306/database_name
```

#### AWS S3 Variables (if using file uploads)

```env
AWS_ACCESS_KEY_ID
your_access_key_id

AWS_SECRET_ACCESS_KEY
your_secret_access_key

AWS_REGION
us-east-1

AWS_S3_BUCKET
your-bucket-name
```

### 5. Deploy

1. Click **"Deploy"**
2. Vercel will automatically:
   - Install dependencies
   - Build the Vite frontend
   - Deploy the Express server
3. Monitor the build logs for any errors
4. Wait for deployment to complete (usually 2-5 minutes)

### 6. Get Your Frontend URL

After deployment completes:
- Your frontend URL will be: `https://your-project-name.vercel.app`
- Or a custom domain if configured

### 7. Update Backend CORS

**CRITICAL STEP**: Update your backend to allow requests from your frontend:

1. Go to your **backend** project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add or update:
   ```env
   FRONTEND_URL
   https://your-frontend.vercel.app
   ```
4. Replace with your actual frontend URL
5. Redeploy the backend (Vercel will do this automatically)

### 8. Verify Deployment

1. Visit your frontend URL: `https://your-frontend.vercel.app`
2. Check that the application loads
3. Open browser DevTools (F12) → Console tab
4. Look for any errors
5. Test key features:
   - User registration/login
   - Browse books
   - Create a listing
   - Search functionality

---

## Troubleshooting

### Build Fails with TypeScript Errors

**Problem**: TypeScript compilation errors during build

**Solution**:
```bash
# Run locally to catch errors
npm run check

# Fix any TypeScript errors
# Then commit and push
git add .
git commit -m "Fix TypeScript errors"
git push
```

### Build Fails with "Module not found"

**Problem**: Missing dependencies

**Solution**:
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Critical packages like `tsx`, `typescript` should be in `dependencies` for Vercel
- Check `package.json` and move if needed:
  ```json
  "dependencies": {
    "tsx": "^4.19.1",
    "typescript": "5.9.3"
  }
  ```

### Server Fails to Start

**Problem**: Application crashes on startup

**Solution**:
- Check Vercel deployment logs
- Ensure `NODE_ENV=production` is set
- Verify all required environment variables are configured
- Check that `server/_core/index.ts` doesn't have syntax errors

### API Calls Fail with CORS Errors

**Problem**: Browser console shows CORS errors like:
```
Access to fetch at 'https://backend.vercel.app/api/...' from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Solution**:
1. Verify backend `FRONTEND_URL` is set correctly
2. Ensure no trailing slashes in URLs
3. Check backend CORS configuration allows credentials
4. Verify both URLs use HTTPS

### API Calls Return 404

**Problem**: All API requests fail with 404 errors

**Solution**:
- Check `VITE_API_URL` is set correctly in frontend
- Verify backend is running (visit backend health endpoint)
- Check browser Network tab to see actual URL being called
- Ensure API endpoints match between frontend and backend

### Environment Variables Not Working

**Problem**: `import.meta.env.VITE_API_URL` is undefined

**Solution**:
- Environment variables must start with `VITE_` to be accessible in client code
- Redeploy after adding environment variables
- Check Vercel dashboard that variables are set
- Verify you're using `import.meta.env.VITE_API_URL` not `process.env.VITE_API_URL`

### Cold Start Delays

**Problem**: First request after inactivity is very slow

**Solution**:
- This is normal for Vercel serverless functions
- Consider upgrading to Vercel Pro for better performance
- Or use a cron job to keep the function warm
- Or switch to Railway for always-on server

### Database Connection Errors

**Problem**: Frontend can't connect to database

**Solution**:
- Verify `DATABASE_URL` is set correctly
- Ensure database allows connections from Vercel IPs
- Consider using connection pooling for serverless
- Check Drizzle ORM configuration

---

## Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update backend `FRONTEND_URL` to your custom domain

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Production**: Pushes to `main` branch
- **Preview**: Pushes to other branches (feature branches)

### Environment-Specific Variables

For staging vs production:
1. Create separate Vercel projects
2. Use different GitHub branches
3. Configure different environment variables for each

---

## Monitoring and Logs

### View Deployment Logs

1. Go to your project in Vercel
2. Click **Deployments**
3. Click on a deployment
4. View build logs and runtime logs

### View Runtime Logs

1. Go to your project in Vercel
2. Click **Logs** tab
3. Filter by time period
4. Search for errors

### Browser Console

- Open DevTools (F12)
- Check Console tab for client-side errors
- Check Network tab for failed API requests

---

## Performance Optimization

### Vite Build Optimization

Already configured in your `vite.config.ts`:
- Code splitting enabled
- Assets minified
- Tree shaking enabled

### Caching

- Static assets are automatically cached by Vercel
- Consider adding a CDN for global distribution

### Bundle Size

Check bundle size:
```bash
npm run build
# Check dist/public folder size
```

---

## Security Best Practices

- ✅ Always use HTTPS (Vercel provides this automatically)
- ✅ Set `NODE_ENV=production`
- ✅ Keep dependencies updated
- ✅ Use environment variables for sensitive data
- ✅ Never commit `.env` files to Git
- ✅ Enable CORS only for your backend domain
- ✅ Regularly review Vercel logs for suspicious activity

---

## Deployment Checklist

### Before Deploying

- [ ] Backend is deployed on Vercel
- [ ] Backend URL is known
- [ ] All code is committed and pushed to GitHub
- [ ] `vercel.json` is in the repository
- [ ] Build succeeds locally (`npm run build`)
- [ ] TypeScript check passes (`npm run check`)

### During Deployment

- [ ] Vercel project created
- [ ] Framework preset set to "Other"
- [ ] `VITE_API_URL` environment variable set
- [ ] `NODE_ENV=production` environment variable set
- [ ] Database URL set (if applicable)
- [ ] AWS credentials set (if applicable)
- [ ] Build completes successfully

### After Deployment

- [ ] Frontend loads without errors
- [ ] Backend `FRONTEND_URL` updated with frontend URL
- [ ] Login/authentication works
- [ ] API calls succeed (check browser console)
- [ ] Browse books feature works
- [ ] Search functionality works
- [ ] Create listing works
- [ ] All core features tested

---

## Common Issues and Solutions

### Issue: "Cannot find module 'tsx'"

**Solution**: Move `tsx` from `devDependencies` to `dependencies` in `package.json`

### Issue: Vite build fails

**Solution**: Ensure build command is `npm run build` and output directory is `dist/public`

### Issue: 500 Internal Server Error

**Solution**: Check Vercel runtime logs for the actual error message

### Issue: Database connection timeout

**Solution**: Use connection pooling or ensure database allows Vercel IP ranges

---

## Alternative: Railway Deployment

If you encounter issues with Vercel's serverless architecture, consider Railway:

### Why Railway Might Be Better

✅ **Always-on server** (not serverless)  
✅ **No timeout limits**  
✅ **Better for database connections**  
✅ **Easier WebSocket support** (if needed)  
✅ **Free tier available**

### Quick Railway Setup

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your frontend repository
4. Railway auto-detects and deploys
5. Add environment variables in Railway dashboard

---

## Need Help?

If you encounter issues:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Review deployment logs in Vercel dashboard
- Check browser console for client-side errors
- Verify all environment variables are set correctly
- Ensure backend CORS is configured properly

---

## Quick Reference

### Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Your Frontend**: https://your-project.vercel.app
- **Your Backend**: https://your-backend.vercel.app

### Important Commands

```bash
# Build locally
npm run build

# Type check
npm run check

# Run production mode locally
npm start

# Deploy (automatic via Git push)
git push origin main
```

### Important Files

- `vercel.json` - Vercel configuration
- `package.json` - Build scripts and dependencies
- `vite.config.ts` - Vite build configuration
- `.env.example` - Environment variable template

---

Good luck with your deployment! 🚀
