"""
Meal Plan Generator
Uses content-based filtering to generate personalized meal plans
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import os

class MealPlanGenerator:
    def __init__(self):
        self.foods_db = self.load_foods_database()
        self.vectorizer = None
        self.food_vectors = None
        self.setup_vectorizer()
    
    def load_foods_database(self):
        """Load foods database (in production, this would come from MongoDB)"""
        # Sample foods database
        foods = [
            {
                "id": "1",
                "name": "Oatmeal with Berries",
                "category": "breakfast",
                "calories": 300,
                "protein": 10,
                "carbs": 50,
                "fats": 5,
                "vegetarian": True,
                "vegan": True,
                "tags": ["healthy", "fiber", "antioxidants"]
            },
            {
                "id": "2",
                "name": "Grilled Chicken Breast",
                "category": "lunch",
                "calories": 231,
                "protein": 43,
                "carbs": 0,
                "fats": 5,
                "vegetarian": False,
                "vegan": False,
                "tags": ["high-protein", "lean", "low-carb"]
            },
            {
                "id": "3",
                "name": "Salmon with Vegetables",
                "category": "dinner",
                "calories": 350,
                "protein": 35,
                "carbs": 15,
                "fats": 18,
                "vegetarian": False,
                "vegan": False,
                "tags": ["omega-3", "healthy-fats", "protein"]
            },
            {
                "id": "4",
                "name": "Greek Yogurt",
                "category": "snack",
                "calories": 100,
                "protein": 17,
                "carbs": 6,
                "fats": 0,
                "vegetarian": True,
                "vegan": False,
                "tags": ["protein", "probiotics", "calcium"]
            },
            {
                "id": "5",
                "name": "Quinoa Salad",
                "category": "lunch",
                "calories": 250,
                "protein": 8,
                "carbs": 45,
                "fats": 6,
                "vegetarian": True,
                "vegan": True,
                "tags": ["complete-protein", "fiber", "gluten-free"]
            },
            {
                "id": "6",
                "name": "Scrambled Eggs",
                "category": "breakfast",
                "calories": 200,
                "protein": 14,
                "carbs": 2,
                "fats": 15,
                "vegetarian": True,
                "vegan": False,
                "tags": ["protein", "vitamins", "choline"]
            },
            {
                "id": "7",
                "name": "Brown Rice with Vegetables",
                "category": "dinner",
                "calories": 220,
                "protein": 5,
                "carbs": 45,
                "fats": 2,
                "vegetarian": True,
                "vegan": True,
                "tags": ["fiber", "complex-carbs", "vitamins"]
            },
            {
                "id": "8",
                "name": "Almonds",
                "category": "snack",
                "calories": 160,
                "protein": 6,
                "carbs": 6,
                "fats": 14,
                "vegetarian": True,
                "vegan": True,
                "tags": ["healthy-fats", "protein", "vitamin-e"]
            }
        ]
        return foods
    
    def setup_vectorizer(self):
        """Setup TF-IDF vectorizer for content-based filtering"""
        # Create text features from food properties
        food_texts = []
        for food in self.foods_db:
            text = f"{food['name']} {food['category']} {' '.join(food.get('tags', []))}"
            if food.get('vegetarian'):
                text += " vegetarian"
            if food.get('vegan'):
                text += " vegan"
            food_texts.append(text)
        
        self.vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        self.food_vectors = self.vectorizer.fit_transform(food_texts)
    
    def filter_foods(self, preferences, dietary_restrictions, allergies):
        """Filter foods based on preferences and restrictions"""
        filtered = []
        for food in self.foods_db:
            # Check vegetarian/vegan preferences
            if preferences.get('vegetarian') and not food.get('vegetarian'):
                continue
            if preferences.get('vegan') and not food.get('vegan'):
                continue
            
            # Check allergies (simplified)
            skip = False
            for allergy in allergies:
                if allergy.lower() in food['name'].lower():
                    skip = True
                    break
            if skip:
                continue
            
            filtered.append(food)
        
        return filtered if filtered else self.foods_db  # Fallback to all foods
    
    def generate(self, target_calories, preferences=None, dietary_restrictions=None, 
                 allergies=None, goal="maintain", plan_type="daily"):
        """
        Generate meal plan
        """
        preferences = preferences or {}
        dietary_restrictions = dietary_restrictions or []
        allergies = allergies or []
        
        # Filter foods
        available_foods = self.filter_foods(preferences, dietary_restrictions, allergies)
        
        # Meal calorie distribution
        meal_distribution = {
            'breakfast': target_calories * 0.25,
            'lunch': target_calories * 0.35,
            'dinner': target_calories * 0.30,
            'snack': target_calories * 0.10
        }
        
        meals = []
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fats = 0
        
        for meal_type, target_meal_calories in meal_distribution.items():
            # Filter foods for this meal type
            meal_foods = [f for f in available_foods if f['category'] == meal_type]
            if not meal_foods:
                meal_foods = available_foods  # Fallback
            
            # Select foods to meet calorie target
            selected_foods = []
            meal_calories = 0
            meal_protein = 0
            meal_carbs = 0
            meal_fats = 0
            
            # Simple greedy selection
            for food in meal_foods[:3]:  # Limit to 3 foods per meal
                if meal_calories + food['calories'] <= target_meal_calories * 1.2:
                    selected_foods.append({
                        "food": food['id'],
                        "quantity": 1,
                        "servingSize": "100g"
                    })
                    meal_calories += food['calories']
                    meal_protein += food['protein']
                    meal_carbs += food['carbs']
                    meal_fats += food['fats']
            
            meals.append({
                "mealType": meal_type,
                "foods": selected_foods,
                "totalCalories": meal_calories,
                "totalProtein": meal_protein,
                "totalCarbs": meal_carbs,
                "totalFats": meal_fats
            })
            
            total_calories += meal_calories
            total_protein += meal_protein
            total_carbs += meal_carbs
            total_fats += meal_fats
        
        return {
            "meals": meals,
            "total_calories": total_calories,
            "total_protein": total_protein,
            "total_carbs": total_carbs,
            "total_fats": total_fats
        }


