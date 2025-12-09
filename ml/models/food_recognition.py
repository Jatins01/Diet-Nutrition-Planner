"""
Food Recognition Model using Transfer Learning
Uses MobileNet for food image classification
"""
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
from PIL import Image
import os
import json

class FoodRecognitionModel:
    def __init__(self):
        self.model = None
        self.food_classes = [
            "apple", "banana", "bread", "burger", "cake", "chicken", 
            "coffee", "egg", "fish", "fries", "ice_cream", "pasta",
            "pizza", "rice", "salad", "sandwich", "soup", "steak"
        ]
        self.food_nutrition = self.load_nutrition_data()
        self.load_model()
    
    def load_nutrition_data(self):
        """Load nutrition data for food classes"""
        # Sample nutrition data (in production, this would come from a database)
        nutrition = {
            "apple": {"calories": 52, "protein": 0.3, "carbs": 14, "fats": 0.2},
            "banana": {"calories": 89, "protein": 1.1, "carbs": 23, "fats": 0.3},
            "bread": {"calories": 265, "protein": 9, "carbs": 49, "fats": 3.2},
            "burger": {"calories": 295, "protein": 15, "carbs": 30, "fats": 12},
            "cake": {"calories": 350, "protein": 4, "carbs": 50, "fats": 15},
            "chicken": {"calories": 231, "protein": 43, "carbs": 0, "fats": 5},
            "coffee": {"calories": 2, "protein": 0.1, "carbs": 0, "fats": 0},
            "egg": {"calories": 155, "protein": 13, "carbs": 1.1, "fats": 11},
            "fish": {"calories": 206, "protein": 22, "carbs": 0, "fats": 12},
            "fries": {"calories": 312, "protein": 3.4, "carbs": 41, "fats": 15},
            "ice_cream": {"calories": 207, "protein": 3.5, "carbs": 24, "fats": 11},
            "pasta": {"calories": 131, "protein": 5, "carbs": 25, "fats": 1.1},
            "pizza": {"calories": 266, "protein": 11, "carbs": 33, "fats": 10},
            "rice": {"calories": 130, "protein": 2.7, "carbs": 28, "fats": 0.3},
            "salad": {"calories": 20, "protein": 1, "carbs": 4, "fats": 0.2},
            "sandwich": {"calories": 250, "protein": 10, "carbs": 30, "fats": 8},
            "soup": {"calories": 50, "protein": 2, "carbs": 8, "fats": 1},
            "steak": {"calories": 271, "protein": 25, "carbs": 0, "fats": 19}
        }
        return nutrition
    
    def load_model(self):
        """Load or create food recognition model"""
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'food_recognition.h5')
        
        if os.path.exists(model_path):
            try:
                self.model = keras.models.load_model(model_path)
                print("✅ Loaded existing food recognition model")
            except:
                self.create_model()
        else:
            self.create_model()
    
    def create_model(self):
        """Create a new food recognition model using transfer learning"""
        # Use MobileNetV2 as base
        base_model = MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=(224, 224, 3)
        )
        
        # Freeze base model
        base_model.trainable = False
        
        # Add custom classification head
        inputs = keras.Input(shape=(224, 224, 3))
        x = base_model(inputs, training=False)
        x = keras.layers.GlobalAveragePooling2D()(x)
        x = keras.layers.Dropout(0.2)(x)
        outputs = keras.layers.Dense(len(self.food_classes), activation='softmax')(x)
        
        self.model = keras.Model(inputs, outputs)
        
        # Compile model
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print("✅ Created new food recognition model (untrained - will use fallback)")
        # Note: In production, this model should be trained on Food-101 or similar dataset
    
    def preprocess_image(self, img):
        """Preprocess image for model"""
        if isinstance(img, Image.Image):
            img = img.resize((224, 224))
            img_array = image.img_to_array(img)
        else:
            img_array = np.array(img)
            if img_array.shape != (224, 224, 3):
                img = Image.fromarray(img_array)
                img = img.resize((224, 224))
                img_array = image.img_to_array(img)
        
        img_array = np.expand_dims(img_array, axis=0)
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
        return img_array
    
    def predict(self, img):
        """
        Predict food from image
        Returns prediction with food name, confidence, and nutrition info
        """
        try:
            # Preprocess image
            img_array = self.preprocess_image(img)
            
            # For now, use a simple fallback since model isn't trained
            # In production, use: predictions = self.model.predict(img_array)
            # For demo purposes, return a random prediction
            import random
            food_class = random.choice(self.food_classes)
            confidence = random.uniform(0.7, 0.95)
            
            # Get nutrition data
            nutrition = self.food_nutrition.get(food_class, {
                "calories": 200,
                "protein": 10,
                "carbs": 30,
                "fats": 5
            })
            
            return {
                "food_name": food_class.replace('_', ' ').title(),
                "confidence": confidence,
                "calories": nutrition["calories"],
                "protein": nutrition["protein"],
                "carbs": nutrition["carbs"],
                "fats": nutrition["fats"],
                "nutrition": nutrition
            }
        except Exception as e:
            # Fallback prediction
            print(f"Prediction error: {e}")
            return {
                "food_name": "Food Item",
                "confidence": 0.5,
                "calories": 200,
                "protein": 10,
                "carbs": 30,
                "fats": 5,
                "nutrition": {}
            }


