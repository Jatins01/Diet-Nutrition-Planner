import User from '../models/User.model.js';
import MealPlan from '../models/MealPlan.model.js';
import Food from '../models/Food.model.js';
import { calculateAllCalories } from '../utils/calculateCalories.js';
import axios from 'axios';

// @desc    Calculate calories (BMR + TDEE)
// @route   POST /api/diet/calculate-calories
// @access  Private
export const calculateCalories = async (req, res) => {
  try {
    const { weight, height, age, gender, activityLevel, goal } = req.body;
    const userId = req.user.id;

    // Use provided data or user's existing data
    const user = await User.findById(userId);
    const calcData = {
      weight: weight || user.weight,
      height: height || user.height,
      age: age || user.age,
      gender: gender || user.gender,
      activityLevel: activityLevel || user.activityLevel || 'sedentary',
      goal: goal || user.goal || 'maintain'
    };

    if (!calcData.weight || !calcData.height || !calcData.age || !calcData.gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide weight, height, age, and gender'
      });
    }

    // Calculate calories
    const calories = calculateAllCalories(calcData);

    // Update user if new data provided
    if (weight || height || age || gender || activityLevel || goal) {
      if (weight) user.weight = weight;
      if (height) user.height = height;
      if (age) user.age = age;
      if (gender) user.gender = gender;
      if (activityLevel) user.activityLevel = activityLevel;
      if (goal) user.goal = goal;
      
      user.bmr = calories.bmr;
      user.tdee = calories.tdee;
      user.targetCalories = calories.targetCalories;
      await user.save();
    }

    res.json({
      success: true,
      data: calories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error calculating calories'
    });
  }
};

// @desc    Generate AI meal plan
// @route   POST /api/diet/generate-plan
// @access  Private
export const generateMealPlan = async (req, res) => {
  try {
    const { date, type = 'daily' } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const targetCalories = user.targetCalories || 2000;
    if (!user.targetCalories) {
      user.targetCalories = targetCalories;
      await user.save();
    }

    const userObj = user.toObject ? user.toObject() : { ...user, preferences: user.preferences };
    const fallbackPlan = await generateFallbackMealPlan({ ...userObj, targetCalories });

    if (!fallbackPlan.meals || fallbackPlan.meals.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No foods in database. Please run: cd server && npm run seed'
      });
    }

    const mealPlan = await MealPlan.create({
      user: userId,
      date: date ? new Date(date) : new Date(),
      type: type,
      meals: fallbackPlan.meals,
      totalCalories: fallbackPlan.totalCalories,
      totalProtein: fallbackPlan.totalProtein,
      totalCarbs: fallbackPlan.totalCarbs,
      totalFats: fallbackPlan.totalFats,
      targetCalories
    });

    await mealPlan.populate({
      path: 'meals.foods.food',
      model: 'Food'
    });

    res.json({
      success: true,
      data: mealPlan
    });
  } catch (error) {
    console.error('Generate meal plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating meal plan'
    });
  }
};

// Fallback meal plan generator (uses MongoDB foods)
const generateFallbackMealPlan = async (user) => {
  const targetCalories = user.targetCalories || 2000;
  const caloriesPerMeal = {
    breakfast: targetCalories * 0.25,
    lunch: targetCalories * 0.35,
    dinner: targetCalories * 0.30,
    snack: targetCalories * 0.10
  };

  const meals = [];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  for (const mealType of mealTypes) {
    const query = {
      isActive: true,
      calories: { $lte: caloriesPerMeal[mealType] * 2 }
    };
    // Prefer category match first
    const categoryQuery = { ...query, category: mealType };
    let foods = await Food.find(categoryQuery).limit(5);

    if (foods.length === 0) {
      foods = await Food.find(query).limit(5);
    }

    if (user.preferences?.vegetarian) {
      foods = foods.filter(f => f.vegetarian);
    }
    if (user.preferences?.vegan) {
      foods = foods.filter(f => f.vegan);
    }
    if (foods.length === 0) {
      foods = await Food.find({ isActive: true }).limit(5);
    }

    if (foods.length > 0) {
      const selectedFoods = foods.slice(0, 2).map(food => ({
        food: food._id,
        quantity: 1,
        servingSize: food.servingSize || '100g'
      }));

      const mealCalories = selectedFoods.reduce((sum, item) => {
        const f = foods.find(x => x._id.toString() === item.food.toString());
        return sum + (f ? f.calories : 0);
      }, 0);

      meals.push({
        mealType,
        foods: selectedFoods,
        totalCalories: mealCalories,
        totalProtein: foods.slice(0, 2).reduce((s, f) => s + f.protein, 0),
        totalCarbs: foods.slice(0, 2).reduce((s, f) => s + f.carbs, 0),
        totalFats: foods.slice(0, 2).reduce((s, f) => s + f.fats, 0)
      });
    }
  }

  return {
    meals,
    totalCalories: meals.reduce((sum, m) => sum + m.totalCalories, 0),
    totalProtein: meals.reduce((sum, m) => sum + m.totalProtein, 0),
    totalCarbs: meals.reduce((sum, m) => sum + m.totalCarbs, 0),
    totalFats: meals.reduce((sum, m) => sum + m.totalFats, 0)
  };
};

// @desc    Get weekly meal plan
// @route   GET /api/diet/weekly-plan
// @access  Private
export const getWeeklyPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date();

    // Get start of week (Monday)
    const dayOfWeek = startDate.getDay();
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(startDate.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    // Get end of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const mealPlans = await MealPlan.find({
      user: userId,
      date: { $gte: weekStart, $lte: weekEnd },
      type: 'daily'
    }).populate('meals.foods.food').sort({ date: 1 });

    res.json({
      success: true,
      data: mealPlans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching weekly plan'
    });
  }
};


