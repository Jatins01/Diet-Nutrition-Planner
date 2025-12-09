"""
FastAPI application for ML services
Provides endpoints for food recognition, meal plan generation, and chatbot
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import os
from dotenv import load_dotenv

# Import ML models
from models.calorie_predictor import CaloriePredictor
from models.meal_planner import MealPlanGenerator
from models.food_recognition import FoodRecognitionModel

load_dotenv()

app = FastAPI(title="Diet Planner ML API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models (lazy loading)
calorie_predictor = None
meal_planner = None
food_recognition = None

def get_calorie_predictor():
    global calorie_predictor
    if calorie_predictor is None:
        calorie_predictor = CaloriePredictor()
    return calorie_predictor

def get_meal_planner():
    global meal_planner
    if meal_planner is None:
        meal_planner = MealPlanGenerator()
    return meal_planner

def get_food_recognition():
    global food_recognition
    if food_recognition is None:
        food_recognition = FoodRecognitionModel()
    return food_recognition

# Request models
class MealPlanRequest(BaseModel):
    target_calories: float
    preferences: Optional[Dict[str, Any]] = {}
    dietary_restrictions: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    goal: str = "maintain"
    type: str = "daily"

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = {}
    user_id: Optional[str] = None

class FoodImageRequest(BaseModel):
    image: str  # Base64 encoded image

@app.get("/")
async def root():
    return {"message": "Diet Planner ML API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/predict-food")
async def predict_food(request: FoodImageRequest):
    """
    Predict food item from image
    """
    try:
        # Decode base64 image
        if request.image.startswith('data:'):
            image_data = request.image.split(',')[1]
        else:
            image_data = request.image
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        image = image.convert('RGB')
        image = image.resize((224, 224))
        
        # Get prediction
        model = get_food_recognition()
        prediction = model.predict(image)
        
        return {
            "food_name": prediction["food_name"],
            "confidence": float(prediction["confidence"]),
            "calories": prediction.get("calories", 0),
            "protein": prediction.get("protein", 0),
            "carbs": prediction.get("carbs", 0),
            "fats": prediction.get("fats", 0),
            "nutrition": prediction.get("nutrition", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/generate-meal-plan")
async def generate_meal_plan(request: MealPlanRequest):
    """
    Generate personalized meal plan using ML
    """
    try:
        planner = get_meal_planner()
        meal_plan = planner.generate(
            target_calories=request.target_calories,
            preferences=request.preferences,
            dietary_restrictions=request.dietary_restrictions,
            allergies=request.allergies,
            goal=request.goal,
            plan_type=request.type
        )
        
        return meal_plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating meal plan: {str(e)}")

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    AI Nutrition Assistant Chat
    """
    try:
        # Simple rule-based chatbot (can be replaced with LLM)
        response = generate_chat_response(request.message, request.context)
        
        return {
            "response": response["message"],
            "suggestions": response.get("suggestions", []),
            "related_foods": response.get("related_foods", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

def generate_chat_response(message: str, context: Dict) -> Dict:
    """
    Generate chatbot response (rule-based, can be replaced with LLM)
    """
    message_lower = message.lower()
    
    # Calorie questions
    if any(word in message_lower for word in ['calorie', 'calories', 'cal']):
        return {
            "message": "Calories are units of energy. Your daily calorie needs depend on your BMR (Basal Metabolic Rate) and activity level. To maintain weight, eat calories equal to your TDEE. To lose weight, create a 500-1000 calorie deficit. To gain weight, add 300-500 calories to your TDEE.",
            "suggestions": [
                "Calculate your BMR and TDEE in the dashboard",
                "Track your daily calorie intake",
                "Aim for a balanced diet with all macronutrients"
            ]
        }
    
    # Protein questions
    if any(word in message_lower for word in ['protein', 'proteins']):
        return {
            "message": "Protein is essential for muscle repair and growth. Aim for 0.8-1.2g per kg of body weight daily. Good sources include chicken, fish, eggs, legumes, dairy, and plant-based proteins like tofu and tempeh.",
            "suggestions": [
                "Include protein in every meal",
                "Choose lean protein sources",
                "Consider plant-based proteins for variety"
            ],
            "related_foods": ["chicken", "salmon", "eggs", "tofu", "lentils"]
        }
    
    # Weight loss
    if any(word in message_lower for word in ['lose weight', 'weight loss', 'diet']):
        return {
            "message": "For healthy weight loss, focus on creating a sustainable calorie deficit, eating nutrient-dense foods, staying hydrated, and maintaining regular physical activity. Aim for 1-2 pounds per week for sustainable results.",
            "suggestions": [
                "Track your daily calories",
                "Increase protein intake to feel full",
                "Include plenty of vegetables and fiber",
                "Stay consistent with your routine"
            ]
        }
    
    # Default response
    return {
        "message": "I'm here to help with your nutrition questions! I can provide information about calories, macronutrients, meal planning, and dietary advice. What specific topic would you like to know more about?",
        "suggestions": [
            "Ask about calories and TDEE",
            "Learn about macronutrients",
            "Get meal planning tips",
            "Understand weight management"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


