"""
Calorie Predictor Model
Uses regression to predict calorie requirements more accurately
"""
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import pickle
import os

class CaloriePredictor:
    def __init__(self):
        self.model = None
        self.model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'calorie_predictor.pkl')
        self.load_or_train()
    
    def load_or_train(self):
        """Load existing model or train a new one"""
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print("✅ Loaded existing calorie predictor model")
            except:
                self.train_default()
        else:
            self.train_default()
    
    def train_default(self):
        """Train a default model with synthetic data"""
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 1000
        
        # Features: age, gender (0=male, 1=female), weight, height, activity_level
        X = np.random.rand(n_samples, 5)
        X[:, 0] = np.random.randint(18, 80, n_samples)  # age
        X[:, 1] = np.random.randint(0, 2, n_samples)  # gender
        X[:, 2] = np.random.uniform(50, 120, n_samples)  # weight (kg)
        X[:, 3] = np.random.uniform(150, 200, n_samples)  # height (cm)
        X[:, 4] = np.random.uniform(1.2, 1.9, n_samples)  # activity multiplier
        
        # Calculate target calories using Harris-Benedict equation
        y = []
        for i in range(n_samples):
            age, gender, weight, height, activity = X[i]
            if gender == 0:  # male
                bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
            else:  # female
                bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
            tdee = bmr * activity
            y.append(tdee)
        
        y = np.array(y)
        
        # Train model
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        
        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        print("✅ Trained and saved calorie predictor model")
    
    def predict(self, age, gender, weight, height, activity_level):
        """
        Predict calorie requirements
        Args:
            age: Age in years
            gender: 'male' or 'female' (converted to 0 or 1)
            weight: Weight in kg
            height: Height in cm
            activity_level: Activity multiplier (1.2 to 1.9)
        Returns:
            Predicted calories
        """
        if self.model is None:
            self.load_or_train()
        
        # Convert gender to numeric
        gender_num = 0 if gender == 'male' else 1
        
        # Prepare features
        features = np.array([[age, gender_num, weight, height, activity_level]])
        
        prediction = self.model.predict(features)[0]
        return max(1200, prediction)  # Minimum 1200 calories for safety


