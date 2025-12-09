# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for the Personalized Diet & Nutrition Planner Using AI, a full-stack web application that provides personalized meal planning, food recognition, and nutrition tracking using machine learning.

### 1.2 Scope
The system will provide:
- User authentication and profile management
- AI-powered calorie calculation (BMR/TDEE)
- Personalized meal plan generation
- Food image recognition
- Nutrition analysis
- Daily food tracking
- Progress visualization
- AI nutrition chatbot

### 1.3 Definitions
- **BMR**: Basal Metabolic Rate - calories burned at rest
- **TDEE**: Total Daily Energy Expenditure - total calories burned per day
- **CNN**: Convolutional Neural Network
- **ML**: Machine Learning

## 2. Functional Requirements

### 2.1 User Management
- **FR-1.1**: Users can register with email and password
- **FR-1.2**: Users can login and logout
- **FR-1.3**: Users can update their profile (age, height, weight, goals)
- **FR-1.4**: System stores user preferences and dietary restrictions

### 2.2 Calorie Calculation
- **FR-2.1**: System calculates BMR using Harris-Benedict equation
- **FR-2.2**: System calculates TDEE based on activity level
- **FR-2.3**: System calculates target calories based on user goal
- **FR-2.4**: ML model enhances calorie predictions

### 2.3 Meal Planning
- **FR-3.1**: System generates daily meal plans
- **FR-3.2**: System generates weekly meal plans
- **FR-3.3**: Meal plans respect dietary restrictions and preferences
- **FR-3.4**: Meal plans meet calorie targets
- **FR-3.5**: ML-based content filtering for recommendations

### 2.4 Food Recognition
- **FR-4.1**: Users can upload food images
- **FR-4.2**: System recognizes food items using CNN
- **FR-4.3**: System displays calories and nutrition info
- **FR-4.4**: Recognized foods can be added to food log

### 2.5 Nutrition Analysis
- **FR-5.1**: System analyzes food nutrition
- **FR-5.2**: System provides nutrition scores
- **FR-5.3**: System suggests healthier alternatives

### 2.6 Food Tracking
- **FR-6.1**: Users can log meals
- **FR-6.2**: System tracks daily calorie intake
- **FR-6.3**: System compares intake with targets
- **FR-6.4**: System maintains history

### 2.7 Progress Tracking
- **FR-7.1**: System displays daily intake graphs
- **FR-7.2**: System shows weekly trends
- **FR-7.3**: System tracks weight progress
- **FR-7.4**: System calculates diet quality scores

### 2.8 AI Chatbot
- **FR-8.1**: Users can chat with nutrition assistant
- **FR-8.2**: Chatbot provides diet tips
- **FR-8.3**: Chatbot suggests food replacements
- **FR-8.4**: Chatbot answers nutrition questions

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-1.1**: API response time < 500ms for most endpoints
- **NFR-1.2**: Image recognition < 3 seconds
- **NFR-1.3**: Support 100+ concurrent users

### 3.2 Security
- **NFR-2.1**: Passwords encrypted with bcrypt
- **NFR-2.2**: JWT tokens for authentication
- **NFR-2.3**: Input validation on all endpoints
- **NFR-2.4**: CORS properly configured

### 3.3 Usability
- **NFR-3.1**: Responsive design for mobile and desktop
- **NFR-3.2**: Intuitive navigation
- **NFR-3.3**: Modern, clean UI
- **NFR-3.4**: Loading states and error messages

### 3.4 Reliability
- **NFR-4.1**: 99% uptime
- **NFR-4.2**: Graceful error handling
- **NFR-4.3**: Fallback mechanisms for ML services

### 3.5 Scalability
- **NFR-5.1**: Stateless API design
- **NFR-5.2**: Database indexing
- **NFR-5.3**: Model caching

## 4. System Architecture

### 4.1 Frontend
- React 18 with Vite
- TailwindCSS for styling
- Recharts for visualization
- Zustand for state management

### 4.2 Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication

### 4.3 ML Service
- Python with FastAPI
- TensorFlow for CNN
- Scikit-learn for ML models

## 5. Database Schema

### 5.1 User Collection
- name, email, password (hashed)
- age, gender, height, weight
- activityLevel, goal
- bmr, tdee, targetCalories
- dietaryRestrictions, allergies, preferences
- role, timestamps

### 5.2 Food Collection
- name, category
- calories, protein, carbs, fats, fiber
- vitamins, minerals
- servingSize, image
- tags, vegetarian, vegan, glutenFree
- timestamps

### 5.3 MealPlan Collection
- user (reference)
- date, type (daily/weekly)
- meals array with foods
- totalCalories, totalProtein, totalCarbs, totalFats
- targetCalories
- timestamps

### 5.4 Tracking Collection
- user (reference)
- date
- meals array
- totalCalories, totalProtein, totalCarbs, totalFats
- targetCalories, weight
- timestamps

## 6. ML Models

### 6.1 Food Recognition
- Model: MobileNetV2 (Transfer Learning)
- Dataset: Food-101 (or similar)
- Output: Food class + confidence

### 6.2 Meal Plan Generator
- Algorithm: Content-based filtering
- Features: TF-IDF vectorization
- Output: Personalized meal plan

### 6.3 Calorie Predictor
- Model: Random Forest Regressor
- Features: age, gender, weight, height, activity
- Output: Predicted calories

## 7. Deployment

### 7.1 Frontend
- Platform: Vercel/Netlify
- Build: Vite production build
- Environment: Production API URL

### 7.2 Backend
- Platform: Railway/Render
- Environment: MongoDB Atlas
- Environment variables configured

### 7.3 ML Service
- Platform: Railway/Render
- Python 3.9+
- Model files included

## 8. Testing

### 8.1 Unit Tests
- Backend API endpoints
- ML model predictions
- Utility functions

### 8.2 Integration Tests
- Frontend-Backend integration
- Backend-ML service integration
- Database operations

### 8.3 User Acceptance Tests
- User registration and login
- Meal plan generation
- Food recognition
- Tracking functionality

## 9. Future Enhancements

- Integration with fitness trackers
- Social features (sharing meal plans)
- Recipe recommendations
- Grocery list generation
- Advanced analytics
- Mobile app (React Native)
- Integration with LLM for better chatbot


