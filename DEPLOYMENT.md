# Frontend Deployment Guide for Railway

This guide will help you deploy the Book Exchange frontend to Railway.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- Backend already deployed (see backend DEPLOYMENT.md)
- Backend Railway URL

## Step-by-Step Deployment

### 1. Create a New Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your frontend repository

### 2. Configure Environment Variables

Go to your frontend service settings and add these environment variables:

```env
# API Configuration (REQUIRED)
VITE_API_URL=https://your-backend-app.railway.app

# Server Configuration (automatically set by Railway)
NODE_ENV=production
PORT=<automatically set by Railway>

# Database Configuration (if using Drizzle ORM)
DATABASE_URL=mysql://user:password@host:3306/database

# AWS S3 Configuration (if using file uploads)
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=your-bucket-name
```

**Critical:** Replace `https://your-backend-app.railway.app` with your actual backend Railway URL.

### 3. Deploy

1. Railway will automatically deploy when you push to your repository
2. Monitor the build logs in the Railway dashboard
3. The build process will:
   - Install dependencies
   - Build the Vite frontend
   - Start the Express server

### 4. Update Backend CORS

After deploying the frontend, you need to update your backend's `FRONTEND_URL` environment variable:

1. Go to your backend service in Railway
2. Add/update the `FRONTEND_URL` environment variable
3. Set it to your frontend's Railway URL (e.g., `https://your-frontend.railway.app`)
4. Railway will automatically redeploy the backend

### 5. Verify Deployment

1. Visit your deployed frontend URL
2. Check that the application loads correctly
3. Test user authentication
4. Verify that API calls work (check browser console for errors)

## Troubleshooting

### Build Fails with TypeScript Errors

**Problem:** TypeScript compilation errors during build

**Solution:**
- Check the build logs for specific errors
- Ensure all TypeScript dependencies are in `dependencies`, not `devDependencies`
- Verify `tsconfig.json` is properly configured
- Run `npm run check` locally to catch errors before deploying

### Server Fails to Start

**Problem:** Application crashes on startup

**Solution:**
- Check Railway logs for error messages
- Ensure `NODE_ENV=production` is set
- Verify all required environment variables are configured
- Check that `tsx` is installed (it should be in devDependencies)

### API Calls Fail with CORS Errors

**Problem:** Browser console shows CORS errors

**Solution:**
- Verify `VITE_API_URL` is set correctly in frontend environment variables
- Ensure backend's `FRONTEND_URL` matches your frontend Railway URL exactly
- Check that both URLs don't have trailing slashes
- Verify backend CORS configuration allows credentials

### API Calls Return 404

**Problem:** All API requests fail with 404 errors

**Solution:**
- Check that `VITE_API_URL` is set correctly
- Verify the backend is running (visit backend health endpoint)
- Check browser network tab to see the actual URL being called
- Ensure API endpoints match between frontend and backend

### Static Files Not Loading

**Problem:** CSS, JS, or images don't load

**Solution:**
- Verify the build completed successfully
- Check that `dist/public` directory was created
- Ensure Vite build output is correct
- Review server static file serving configuration

### Database Connection Errors

**Problem:** Frontend server can't connect to database

**Solution:**
- Verify `DATABASE_URL` is set correctly
- Check database service is running
- Ensure database credentials are correct
- Review Drizzle ORM configuration

## Environment-Specific Configuration

### Development vs Production

The application automatically detects the environment:

- **Development**: Uses Vite dev server with HMR
- **Production**: Serves built static files from `dist/public`

### Multiple Environments

To set up staging and production:

1. Create separate Railway projects
2. Use different GitHub branches
3. Configure environment variables differently for each
4. Point staging frontend to staging backend

## Monitoring and Logs

- View logs in Railway dashboard
- Monitor API request errors in browser console
- Check Network tab for failed requests
- Set up error tracking (e.g., Sentry) for production

## Updating Your Deployment

Railway automatically redeploys when you push to GitHub:

1. Make changes to your code
2. Commit and push to GitHub
3. Railway automatically builds and deploys
4. Monitor deployment in Railway dashboard

## Performance Optimization

### Build Optimization

- Vite automatically optimizes production builds
- Code splitting is enabled by default
- Assets are minified and compressed

### Caching

- Static assets are served with cache headers
- Consider adding a CDN for better performance

## Security Best Practices

- ✅ Always use HTTPS (Railway provides this automatically)
- ✅ Set `NODE_ENV=production`
- ✅ Keep dependencies updated
- ✅ Use environment variables for sensitive data
- ✅ Enable CORS only for your backend domain
- ✅ Regularly review Railway logs for suspicious activity

## Common Deployment Checklist

Before deploying:

- [ ] Backend is deployed and running
- [ ] `VITE_API_URL` points to backend Railway URL
- [ ] Backend `FRONTEND_URL` will be updated after frontend deployment
- [ ] All required environment variables are configured
- [ ] Build succeeds locally (`npm run build`)
- [ ] TypeScript check passes (`npm run check`)

After deploying:

- [ ] Frontend loads without errors
- [ ] Login/authentication works
- [ ] API calls succeed (check browser console)
- [ ] Backend CORS is configured with frontend URL
- [ ] All features work as expected

## Support

If you encounter issues:
- Check Railway documentation: [docs.railway.app](https://docs.railway.app)
- Review application logs in Railway dashboard
- Check browser console for client-side errors
- Verify environment variables are set correctly
