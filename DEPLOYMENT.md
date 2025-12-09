# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- MongoDB (local or Atlas account)
- Git installed
- Accounts on deployment platforms (optional)

## Local Development Setup

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd Diet-Nutrition-Planner

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Setup ML service
cd ../ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables

#### Backend (.env in server/)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/diet-planner
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
ML_API_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env in client/)
```env
VITE_API_URL=http://localhost:5000
VITE_ML_API_URL=http://localhost:8000
```

#### ML Service (.env in ml/)
```env
PORT=8000
ENVIRONMENT=development
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Start MongoDB service
# On macOS with Homebrew:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# On Windows:
# Start MongoDB service from Services
```

**MongoDB Atlas (Cloud):**
- Create account at https://www.mongodb.com/cloud/atlas
- Create cluster
- Get connection string
- Update MONGODB_URI in backend .env

### 4. Run Services

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - ML Service:**
```bash
cd ml
source venv/bin/activate  # On Windows: venv\Scripts\activate
python api/app.py
```

**Terminal 3 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000

## Production Deployment

### Option 1: Vercel (Frontend) + Railway (Backend + ML)

#### Frontend on Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Import repository
4. Set build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable:
   - `VITE_API_URL`: Your backend URL
6. Deploy

#### Backend on Railway

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select repository and server folder
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure secret
   - `ML_API_URL`: Your ML service URL
   - `CORS_ORIGIN`: Your frontend URL
5. Deploy

#### ML Service on Railway

1. New Service in same Railway project
2. Deploy from GitHub, select ml folder
3. Add environment variables:
   - `PORT`: 8000
4. Deploy

### Option 2: Render

#### Frontend on Render

1. Go to https://render.com
2. New Static Site
3. Connect GitHub repository
4. Build command: `cd client && npm install && npm run build`
5. Publish directory: `client/dist`
6. Add environment variables

#### Backend on Render

1. New Web Service
2. Connect GitHub repository
3. Root directory: `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables
7. Use MongoDB Atlas for database

#### ML Service on Render

1. New Web Service
2. Root directory: `ml`
3. Build command: `pip install -r requirements.txt`
4. Start command: `python api/app.py`
5. Add environment variables

### Option 3: Netlify (Frontend) + Heroku (Backend + ML)

#### Frontend on Netlify

1. Go to https://netlify.com
2. New site from Git
3. Build command: `cd client && npm run build`
4. Publish directory: `client/dist`
5. Add environment variables

#### Backend on Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your-uri
   heroku config:set JWT_SECRET=your-secret
   ```
5. Deploy: `git push heroku main`

## Database Setup

### Seed Initial Data (Optional)

Create a seed script to populate foods database:

```javascript
// server/scripts/seed.js
const mongoose = require('mongoose');
const Food = require('../models/Food.model');
const foods = require('./foods.json'); // Your foods data

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    return Food.insertMany(foods);
  })
  .then(() => {
    console.log('Foods seeded successfully');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
```

Run: `node server/scripts/seed.js`

## Environment Variables Checklist

### Backend
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] ML_API_URL
- [ ] CORS_ORIGIN
- [ ] PORT
- [ ] NODE_ENV

### Frontend
- [ ] VITE_API_URL
- [ ] VITE_ML_API_URL

### ML Service
- [ ] PORT
- [ ] ENVIRONMENT

## Post-Deployment

1. Test all endpoints
2. Verify CORS settings
3. Check error logging
4. Monitor performance
5. Set up monitoring (optional)

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify environment variables
- Check port availability

### ML service errors
- Verify Python version (3.9+)
- Check all dependencies installed
- Verify model files exist

### Frontend build fails
- Check Node.js version
- Clear node_modules and reinstall
- Check environment variables

### CORS errors
- Verify CORS_ORIGIN in backend matches frontend URL
- Check API URL in frontend .env

## Security Checklist

- [ ] Use strong JWT_SECRET in production
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Keep dependencies updated
- [ ] Use environment variables (never commit .env)
- [ ] Enable rate limiting (optional)

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Uptime monitoring (UptimeRobot)
- Log aggregation (Logtail, Papertrail)


