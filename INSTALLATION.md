# Installation Guide

## Quick Start

### 1. Prerequisites

Ensure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://www.python.org/downloads/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### 2. Clone Repository

```bash
git clone <repository-url>
cd Diet-Nutrition-Planner
```

### 3. Backend Setup

```bash
cd server
npm install

# Create .env file
cp env.example .env

# Edit .env with your MongoDB URI and JWT secret
# MONGODB_URI=mongodb://localhost:27017/diet-planner
# JWT_SECRET=your-secret-key-here
```

### 4. Frontend Setup

```bash
cd ../client
npm install

# Create .env file
cp env.example .env

# Edit .env with your API URL
# VITE_API_URL=http://localhost:5000
```

### 5. ML Service Setup

```bash
cd ../ml

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional)
# PORT=8000
```

### 6. Database Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# On macOS:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# On Windows:
# Start MongoDB service from Services
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `server/.env`

### 7. Seed Database (Optional)

```bash
cd server
npm run seed
```

This will populate the database with sample food items.

### 8. Run Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - ML Service:**
```bash
cd ml
source venv/bin/activate  # On Windows: venv\Scripts\activate
python api/app.py
```
ML Service will run on http://localhost:8000

**Terminal 3 - Frontend:**
```bash
cd client
npm run dev
```
Frontend will run on http://localhost:5173

### 9. Access Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health
- **ML Service**: http://localhost:8000

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoServerError: Authentication failed"**
- Check your MongoDB URI in `.env`
- Ensure MongoDB is running
- For Atlas, check IP whitelist and credentials

**Error: "MongooseError: connect ECONNREFUSED"**
- Start MongoDB service
- Check if MongoDB is running on default port (27017)

### Python/ML Service Issues

**Error: "ModuleNotFoundError"**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

**Error: "TensorFlow not found"**
- Install TensorFlow: `pip install tensorflow`
- For Apple Silicon: `pip install tensorflow-macos`

### Node.js Issues

**Error: "Cannot find module"**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Error: "Port already in use"**
- Change PORT in `.env` files
- Or kill the process using the port

### Frontend Build Issues

**Error: "Vite build failed"**
- Check Node.js version (should be 18+)
- Clear cache: `rm -rf node_modules .vite`
- Reinstall: `npm install`

## Environment Variables Reference

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/diet-planner
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
ML_API_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
# Optional: for accurate food image recognition (get free key at https://spoonacular.com/food-api)
# SPOONACULAR_API_KEY=your_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_ML_API_URL=http://localhost:8000
```

### ML Service (.env)
```env
PORT=8000
ENVIRONMENT=development
```

## Next Steps

1. Register a new account
2. Complete your profile
3. Calculate your calorie requirements
4. Generate your first meal plan
5. Try the food scanner feature
6. Track your meals

## Development Tips

- Use `npm run dev` for hot-reload during development
- Check browser console for frontend errors
- Check terminal for backend/ML service errors
- Use MongoDB Compass to view database
- API documentation: See `docs/API.md`

## Production Deployment

See `DEPLOYMENT.md` for production deployment instructions.


