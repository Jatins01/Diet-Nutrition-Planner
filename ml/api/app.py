"""
FastAPI application for ML services
Provides endpoints for food recognition, meal plan generation, and chatbot
"""

import sys
import os

# Fix for importing from models folder
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import base64
from io import BytesIO
from PIL import Image
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
    allow_origins=["*"],  # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy loading models
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


# -------------------------
# Request Models
# -------------------------

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
    image: str


# -------------------------
# Routes
# -------------------------

@app.get("/")
async def root():
    return {"message": "Diet Planner ML API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# -------------------------
# Food Recognition API
# -------------------------

@app.post("/predict-food")
async def predict_food(request: FoodImageRequest):

    try:
        if request.image.startswith("data:"):
            image_data = request.image.split(",")[1]
        else:
            image_data = request.image

        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        image = image.resize((224, 224))

        model = get_food_recognition()
        prediction = model.predict(image)

        return {
            "food_name": prediction["food_name"],
            "confidence": float(prediction["confidence"]),
            "calories": prediction.get("calories", 0),
            "protein": prediction.get("protein", 0),
            "carbs": prediction.get("carbs", 0),
            "fats": prediction.get("fats", 0),
            "nutrition": prediction.get("nutrition", {}),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------
# Meal Plan Generator
# -------------------------

@app.post("/generate-meal-plan")
async def generate_meal_plan(request: MealPlanRequest):

    try:
        planner = get_meal_planner()

        meal_plan = planner.generate(
            target_calories=request.target_calories,
            preferences=request.preferences,
            dietary_restrictions=request.dietary_restrictions,
            allergies=request.allergies,
            goal=request.goal,
            plan_type=request.type,
        )

        return meal_plan

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------
# Chatbot API
# -------------------------

@app.post("/chat")
async def chat(request: ChatRequest):

    try:
        response = generate_chat_response(request.message)

        return {
            "response": response["message"],
            "suggestions": response.get("suggestions", []),
            "related_foods": response.get("related_foods", []),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------
# Simple Rule-Based Chatbot
# -------------------------

def generate_chat_response(message: str):

    msg = message.lower()

    if "calorie" in msg:

        return {
            "message": "Calories measure energy in food. Your daily needs depend on your activity level and metabolism.",
            "suggestions": [
                "Calculate your daily calorie requirement",
                "Track calorie intake",
                "Maintain a balanced diet",
            ],
        }

    if "protein" in msg:

        return {
            "message": "Protein helps muscle growth and repair. Good sources include eggs, chicken, fish, lentils, tofu, and dairy.",
            "related_foods": ["eggs", "chicken", "tofu", "lentils", "milk"],
        }

    if "diet" in msg or "weight loss" in msg:

        return {
            "message": "For weight loss maintain a calorie deficit, eat high-protein foods, stay hydrated, and exercise regularly.",
            "suggestions": [
                "Track calories daily",
                "Increase protein intake",
                "Eat more vegetables",
            ],
        }

    return {
        "message": "I can help with nutrition, calories, diet plans, and healthy eating. What would you like to know?",
        "suggestions": [
            "Ask about calories",
            "Ask about protein",
            "Ask about weight loss diet",
        ],
    }


# -------------------------
# Run API
# -------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.app:app", host="0.0.0.0", port=8000, reload=True)