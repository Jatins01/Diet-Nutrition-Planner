# System Architecture

## Overview

The Personalized Diet & Nutrition Planner is a full-stack application with three main components:

1. **Frontend** (React + Vite)
2. **Backend** (Node.js + Express)
3. **ML Service** (Python + FastAPI)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│  React + Vite + TailwindCSS + Recharts                      │
│  - Landing, Login, Register                                  │
│  - Dashboard, Meal Planner, Food Scanner                    │
│  - Nutrition Analyzer, History, Chatbot, Profile            │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      Backend API                              │
│  Node.js + Express + MongoDB + JWT                          │
│  - Authentication & Authorization                           │
│  - User Management                                           │
│  - Diet & Meal Planning                                      │
│  - Food Tracking & History                                  │
│  - Chat Integration                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    ML Service                                │
│  Python + FastAPI + TensorFlow + Scikit-learn               │
│  - Food Recognition (CNN)                                   │
│  - Meal Plan Generation (Content-based Filtering)            │
│  - Calorie Prediction (Regression)                          │
│  - Nutrition Chatbot                                         │
└─────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Database                                   │
│  MongoDB                                                      │
│  - Users, Foods, Meal Plans, Tracking                       │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (Client)

**Technology Stack:**
- React 18 with Vite
- TailwindCSS for styling
- Recharts for data visualization
- Framer Motion for animations
- Zustand for state management
- React Router for navigation

**Key Features:**
- Responsive design (mobile-first)
- Modern UI with glassmorphism effects
- Real-time data visualization
- Image upload for food recognition
- Interactive chatbot interface

### Backend (Server)

**Technology Stack:**
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Axios for ML service communication

**API Endpoints:**
- `/api/auth/*` - Authentication
- `/api/user/*` - User management
- `/api/diet/*` - Meal planning
- `/api/food/*` - Food search and analysis
- `/api/track/*` - Tracking and history
- `/api/chat/*` - Chatbot integration

**Database Models:**
- User: Profile, preferences, goals
- Food: Nutrition information
- MealPlan: Generated meal plans
- Tracking: Daily food logs

### ML Service

**Technology Stack:**
- Python 3.9+
- FastAPI for API
- TensorFlow/Keras for CNN
- Scikit-learn for ML models
- PIL for image processing

**ML Models:**
1. **Food Recognition**: MobileNetV2-based CNN
2. **Meal Plan Generator**: Content-based filtering with TF-IDF
3. **Calorie Predictor**: Random Forest Regressor
4. **Chatbot**: Rule-based (can be replaced with LLM)

## Data Flow

### User Registration Flow
1. User submits registration form
2. Frontend → Backend: POST `/api/auth/register`
3. Backend validates and creates user
4. Backend calculates BMR/TDEE
5. Backend returns JWT token
6. Frontend stores token and redirects to dashboard

### Meal Plan Generation Flow
1. User requests meal plan
2. Frontend → Backend: POST `/api/diet/generate-plan`
3. Backend → ML Service: POST `/generate-meal-plan`
4. ML Service generates plan using ML algorithms
5. Backend saves plan to database
6. Backend returns plan to frontend
7. Frontend displays meal plan

### Food Recognition Flow
1. User uploads food image
2. Frontend → Backend: POST `/api/food/upload-image`
3. Backend → ML Service: POST `/predict-food`
4. ML Service processes image with CNN
5. ML Service returns prediction
6. Backend finds/creates food in database
7. Backend returns food info to frontend
8. Frontend displays results

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation
- Error handling

## Scalability Considerations

- Stateless API design
- Database indexing
- Model caching in ML service
- CDN for static assets
- Load balancing ready

## Deployment

- Frontend: Vercel/Netlify
- Backend: Railway/Render
- ML Service: Railway/Render (or separate GPU instance)
- Database: MongoDB Atlas


