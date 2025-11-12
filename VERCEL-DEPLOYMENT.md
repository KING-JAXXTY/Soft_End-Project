# TulongAral+ Vercel Deployment Guide

## 🚀 Deploy to Vercel

Your project is now configured for Vercel deployment! Follow these steps:

### Prerequisites
- GitHub/GitLab/Bitbucket repository with your code
- Vercel account (free at https://vercel.com)
- MongoDB Atlas database (cloud MongoDB instance)

### Step 1: Push to Repository
Make sure all your code is pushed to your Git repository:
```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

### Step 2: Import Project to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your repository (Soft_End-Project)
4. Vercel will auto-detect the settings

### Step 3: Configure Environment Variables
In Vercel project settings, add these environment variables:

**Required Variables:**
- `MONGODB_URI` = `mongodb+srv://jaxxtycaditan1_db_user:C7WZ2MMBxxDoWKqF@cluster0.oc3jeym.mongodb.net/tulongaral?retryWrites=true&w=majority&appName=Cluster0`
- `JWT_SECRET` = `your_super_secret_jwt_key_change_this_in_production_12345`
- `NODE_ENV` = `production`
- `JWT_EXPIRE` = `7d`

**Optional Variables (if using):**
- `GEMINI_API_KEY` = (your Gemini API key if you have one)

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be live at `https://your-project-name.vercel.app`

### Important Notes

⚠️ **File Uploads**: Vercel's serverless functions have limitations with file storage. Files uploaded will NOT persist across deployments. For production, you should:
- Use a cloud storage service (AWS S3, Cloudinary, etc.)
- Modify the upload routes to save files to cloud storage instead of local filesystem

⚠️ **Database**: Make sure your MongoDB Atlas cluster allows connections from `0.0.0.0/0` (all IPs) or add Vercel's IP ranges to the whitelist.

⚠️ **Function Timeout**: Free Vercel plans have a 10-second function timeout. Upgrade if you need longer execution times.

### Testing Locally
Before deploying, test locally:
```bash
npm install
npm start
```

### Troubleshooting

**404 Errors**: 
- Make sure `vercel.json` is in the root directory
- Check that environment variables are set correctly

**Database Connection Errors**:
- Verify MongoDB URI in Vercel environment variables
- Check MongoDB Atlas network access settings

**API Not Working**:
- All API routes should start with `/api/`
- Check Vercel function logs in dashboard

### Alternative: Use Different Platform

If you encounter limitations with Vercel, consider these alternatives:
- **Railway.app**: Better for full Node.js apps with file storage
- **Render.com**: Free tier with persistent storage
- **Heroku**: Classic platform (paid)
- **DigitalOcean App Platform**: Simple deployment

## 📝 Changes Made for Vercel

1. ✅ Created `vercel.json` - Vercel configuration
2. ✅ Modified `server.js` - Export app for serverless
3. ✅ Added `.gitignore` - Prevent uploading node_modules
4. ✅ Created deployment guide

## 🔗 Useful Links
- [Vercel Documentation](https://vercel.com/docs)
- [Deploying Node.js to Vercel](https://vercel.com/docs/frameworks/node)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas/register)
