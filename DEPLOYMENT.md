# Deployment Guide for Render.com

This guide walks you through deploying the Branch Customer Support application on Render.com.

## Prerequisites

- GitHub account with this repository
- Render.com account (free tier works)

## Step 1: Deploy PostgreSQL Database

1. Log in to [Render.com](https://render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `branch-support-db`
   - **Database**: `branch_support`
   - **User**: `postgres` (or any name)
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click "Create Database"
5. Wait for provisioning (1-2 minutes)
6. Copy the **Internal Database URL** (starts with `postgresql://`)

## Step 2: Initialize Database Schema

1. In the database dashboard, click "Connect"
2. Use the PSQL Command to connect
3. Run the SQL from `backend/init.sql`:

```bash
# Copy the init.sql content and paste it in the PSQL terminal
# Or use this command from your local machine:
psql <EXTERNAL_DATABASE_URL> -f backend/init.sql
```

## Step 3: Deploy Backend

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `branch-support-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Add Environment Variables:
   - `PORT`: `5000`
   - `DATABASE_URL`: (paste Internal Database URL from Step 1)
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: (leave empty for now, will update after frontend deployment)
5. Click "Create Web Service"
6. Wait for deployment (2-3 minutes)
7. Copy the service URL (e.g., `https://branch-support-backend.onrender.com`)

## Step 4: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `branch-support-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: (paste backend URL from Step 3)
5. Click "Create Static Site"
6. Wait for deployment (2-3 minutes)
7. Copy the site URL (e.g., `https://branch-support-frontend.onrender.com`)

## Step 5: Update Backend CORS

1. Go back to backend service settings
2. Update environment variable:
   - `FRONTEND_URL`: (paste frontend URL from Step 4)
3. Click "Save Changes"
4. Backend will automatically redeploy

## Step 6: Test the Application

1. Visit your frontend URL
2. Click "Customer Simulator"
3. Send a test message
4. Go back to Agent Portal
5. Verify the message appears with urgency score
6. Test claiming and responding

## Important Notes

### Free Tier Limitations

- **Database**: 1 GB storage, 97 hours/month uptime
- **Web Service**: Spins down after 15 minutes of inactivity
- **Static Site**: Unlimited bandwidth

### Cold Starts

The backend may take 30-60 seconds to wake up from sleep on the free tier. This is normal.

### Custom Domain (Optional)

1. In frontend settings, go to "Custom Domains"
2. Add your domain
3. Configure DNS as instructed

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Verify all environment variables are set
- Check logs in Render dashboard

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS settings (FRONTEND_URL in backend)
- Ensure backend is running

### Database connection errors
- Verify database is running
- Check DATABASE_URL format
- Ensure database schema is initialized

## Monitoring

- **Logs**: Available in each service's dashboard
- **Metrics**: CPU, memory, and request metrics
- **Alerts**: Set up email alerts for service failures

## Scaling (Paid Plans)

For production use, consider:
- **Database**: Upgrade to Standard ($7/month) for better performance
- **Backend**: Upgrade to Starter ($7/month) for always-on service
- **CDN**: Enable for faster global delivery

## Environment Variables Reference

### Backend
```
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/branch_support
NODE_ENV=production
FRONTEND_URL=https://your-frontend.onrender.com
```

### Frontend
```
VITE_API_URL=https://your-backend.onrender.com
```

## Deployment Checklist

- [ ] PostgreSQL database created
- [ ] Database schema initialized
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] Test message creation works
- [ ] Real-time updates working
- [ ] Search functionality working

---

**Support**: If you encounter issues, check Render's documentation or contact support.
