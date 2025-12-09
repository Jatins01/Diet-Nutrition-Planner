# Personalized Diet & Nutrition Planner Using AI

A full-stack web application with ML integration for personalized diet planning, food recognition, and nutrition tracking.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication system
- **AI Calorie Calculator**: BMR and TDEE calculation with ML-enhanced predictions
- **AI Meal Plan Generator**: Personalized daily and weekly meal plans using ML recommendations
- **Food Image Recognition**: CNN-based food recognition from uploaded images
- **Nutrition Analyzer**: Comprehensive nutrient analysis and scoring
- **Food Logging**: Track daily calorie intake and compare with targets
- **Progress Tracker**: Visualize progress with charts and graphs
- **AI Nutrition Chatbot**: Get diet tips and food recommendations
- **Admin Panel**: Manage foods database and users

## 🏗️ Architecture

```
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
├── ml/              # Python ML models and FastAPI service
└── docs/            # Documentation
```

## 🛠️ Technology Stack

### Frontend
- React 18 + Vite
- TailwindCSS
- Shadcn UI
- Recharts
- Framer Motion

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication

### Machine Learning
- Python 3.9+
- TensorFlow/Keras
- Scikit-learn
- FastAPI

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

### ML Service Setup

```bash
cd ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python api/app.py
```

## 🚀 Running the Application

1. Start MongoDB (if local)
2. Start ML service: `cd ml && python api/app.py`
3. Start backend: `cd server && npm run dev`
4. Start frontend: `cd client && npm run dev`

## 📝 Environment Variables

See `.env.example` files in each directory for required environment variables.

## 📚 Documentation

- [Architecture Documentation](./docs/Architecture.md)
- [API Documentation](./docs/API.md)
- [Software Requirements Specification](./docs/SRS.md)

## 🎨 UI Design

The application features a modern, clean UI inspired by Apple Health and MyFitnessPal with:
- Soft gradients
- Smooth animations
- Glassmorphism effects
- Responsive mobile-first layout

## 🤖 ML Models

1. **Calorie Predictor**: Regression model for accurate calorie requirements
2. **Meal Plan Recommendation**: Content-based filtering for personalized meal plans
3. **Food Recognition CNN**: MobileNet-based food image classification

## 📄 License

MIT

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


