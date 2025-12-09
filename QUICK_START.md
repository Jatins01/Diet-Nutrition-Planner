# Quick Start Guide

## 🚀 How to Run the Application

Follow these steps to get the application running on your local machine.

### Prerequisites Check

Make sure you have installed:
- ✅ Node.js 18+ (`node --version`)
- ✅ Python 3.9+ (`python --version`)
- ✅ MongoDB running locally OR MongoDB Atlas account

---

## Step-by-Step Instructions

### Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 2: Setup Backend Environment

```bash
# Copy the example env file
cp env.example .env

# Edit .env file and set:
# MONGODB_URI=mongodb://localhost:27017/diet-planner
# JWT_SECRET=your-secret-key-here
```

**For MongoDB Atlas (Cloud):**
- Get your connection string from MongoDB Atlas
- Use format: `mongodb+srv://username:password@cluster.mongodb.net/diet-planner`

### Step 3: Install Frontend Dependencies

```bash
cd ../client
npm install
```

### Step 4: Setup Frontend Environment

```bash
# Copy the example env file
cp env.example .env

# The default values should work:
# VITE_API_URL=http://localhost:5000
```

### Step 5: Setup ML Service

```bash
cd ../ml

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 6: Start MongoDB (if using local)

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
- Start MongoDB service from Services panel

**Or use MongoDB Atlas (no local setup needed)**

### Step 7: Seed Database (Optional but Recommended)

```bash
cd ../server
npm run seed
```

This populates the database with sample food items.

### Step 8: Run All Services

You need **3 terminal windows** open:

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

✅ You should see: `🚀 Server running on port 5000`

#### Terminal 2 - ML Service
```bash
cd ml
source venv/bin/activate  # On Windows: venv\Scripts\activate
python api/app.py
```

✅ You should see: `INFO: Uvicorn running on http://0.0.0.0:8000`

#### Terminal 3 - Frontend
```bash
cd client
npm run dev
```

✅ You should see: `Local: http://localhost:5173/`

---

## 🎉 Access the Application

Open your browser and go to:
- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health
- **ML Service**: http://localhost:8000

---

## ✅ Verify Everything is Working

1. **Backend**: Visit http://localhost:5000/api/health
   - Should return: `{"status":"ok","message":"Diet Planner API is running"}`

2. **ML Service**: Visit http://localhost:8000
   - Should return: `{"message":"Diet Planner ML API","status":"running"}`

3. **Frontend**: Visit http://localhost:5173
   - Should show the landing page

---

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- **Solution**: Make sure MongoDB is running
- Check `MONGODB_URI` in `server/.env`
- For Atlas: Check IP whitelist and credentials

### "Port 5000 already in use"
- **Solution**: Change `PORT=5000` to another port in `server/.env`
- Update `VITE_API_URL` in `client/.env` to match

### "Module not found" (Python)
- **Solution**: Make sure virtual environment is activated
- Run: `pip install -r requirements.txt` again

### "Module not found" (Node.js)
- **Solution**: Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Frontend can't connect to backend
- **Solution**: Check `VITE_API_URL` in `client/.env`
- Make sure backend is running on port 5000
- Check CORS settings in `server/server.js`

---

## 📝 First Time Setup Checklist

- [ ] Node.js installed
- [ ] Python 3.9+ installed
- [ ] MongoDB running or Atlas account created
- [ ] Backend dependencies installed (`cd server && npm install`)
- [ ] Frontend dependencies installed (`cd client && npm install`)
- [ ] ML service dependencies installed (`cd ml && pip install -r requirements.txt`)
- [ ] Backend `.env` file configured
- [ ] Frontend `.env` file configured
- [ ] Database seeded (`npm run seed` in server folder)
- [ ] All 3 services running

---

## 🎯 Test the Application

1. **Register a new account**
   - Go to http://localhost:5173
   - Click "Get Started Free"
   - Fill in registration form

2. **Complete your profile**
   - Add age, height, weight, activity level, goal

3. **Calculate calories**
   - Go to Dashboard
   - See your BMR, TDEE, and target calories

4. **Generate meal plan**
   - Go to Meal Planner
   - Click "Generate Plan"

5. **Try food scanner**
   - Go to Food Scanner
   - Upload a food image

6. **Track meals**
   - Add foods to your daily log
   - View history and progress

---

## 🛑 Stopping the Application

Press `Ctrl + C` in each terminal window to stop the services.

---

## 📚 Need More Help?

- **Detailed Installation**: See `INSTALLATION.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **API Documentation**: See `docs/API.md`
- **Architecture**: See `docs/Architecture.md`

---

**Happy coding! 🚀**


