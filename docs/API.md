# API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-api-domain.com/api`

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 30,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "activityLevel": "moderate",
  "goal": "maintain"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### User Management

#### Get Profile
```http
GET /user/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "age": 31,
  "weight": 72,
  ...
}
```

#### Get Dashboard
```http
GET /user/dashboard
Authorization: Bearer <token>
```

### Diet & Meal Planning

#### Calculate Calories
```http
POST /diet/calculate-calories
Authorization: Bearer <token>
Content-Type: application/json

{
  "weight": 70,
  "height": 175,
  "age": 30,
  "gender": "male",
  "activityLevel": "moderate",
  "goal": "lose"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bmr": 1700,
    "tdee": 2635,
    "targetCalories": 2135
  }
}
```

#### Generate Meal Plan
```http
POST /diet/generate-plan
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "type": "daily"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "meals": [...],
    "totalCalories": 2100,
    "totalProtein": 120,
    "totalCarbs": 250,
    "totalFats": 60
  }
}
```

#### Get Weekly Plan
```http
GET /diet/weekly-plan?startDate=2024-01-15
Authorization: Bearer <token>
```

### Food

#### Upload Food Image
```http
POST /food/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "food": {
      "id": "...",
      "name": "Apple",
      "calories": 52,
      ...
    },
    "prediction": {
      "food_name": "Apple",
      "confidence": 0.95,
      ...
    }
  }
}
```

#### Search Food
```http
GET /food/search?item=chicken&limit=20
Authorization: Bearer <token>
```

#### Analyze Nutrition
```http
POST /food/nutrition
Authorization: Bearer <token>
Content-Type: application/json

{
  "foodId": "...",
  "quantity": 1
}
```

### Tracking

#### Add Food to Log
```http
POST /track/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "mealType": "lunch",
  "foodId": "...",
  "quantity": 1,
  "servingSize": "100g"
}
```

#### Get History
```http
GET /track/history?startDate=2024-01-01&endDate=2024-01-31&limit=30
Authorization: Bearer <token>
```

#### Get Progress
```http
GET /track/progress?days=30
Authorization: Bearer <token>
```

### Chatbot

#### Nutrition Assistant
```http
POST /chat/nutrition-assistant
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "How many calories should I eat?",
  "context": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Your daily calorie needs depend on...",
    "suggestions": [...],
    "related_foods": [...]
  }
}
```

## ML Service Endpoints

Base URL: `http://localhost:8000`

### Predict Food
```http
POST /predict-food
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,..."
}
```

### Generate Meal Plan
```http
POST /generate-meal-plan
Content-Type: application/json

{
  "target_calories": 2000,
  "preferences": {},
  "dietary_restrictions": [],
  "allergies": [],
  "goal": "maintain",
  "type": "daily"
}
```

### Chat
```http
POST /chat
Content-Type: application/json

{
  "message": "Tell me about protein",
  "context": {},
  "user_id": "..."
}
```

## Error Responses

All endpoints may return errors in this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error


