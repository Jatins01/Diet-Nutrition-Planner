import User from '../models/User.model.js';
import { calculateAllCalories } from '../utils/calculateCalories.js';

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      height,
      weight,
      activityLevel,
      goal,
      dietaryRestrictions,
      allergies,
      preferences
    } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (age) user.age = age;
    if (gender) user.gender = gender;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    if (activityLevel) user.activityLevel = activityLevel;
    if (goal) user.goal = goal;
    if (dietaryRestrictions) user.dietaryRestrictions = dietaryRestrictions;
    if (allergies) user.allergies = allergies;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    // Recalculate calories if body metrics changed
    if (weight && height && age && gender) {
      const calories = calculateAllCalories({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goal: user.goal
      });

      user.bmr = calories.bmr;
      user.tdee = calories.tdee;
      user.targetCalories = calories.targetCalories;
    }

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

// @desc    Get user dashboard data
// @route   GET /api/user/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    // Calculate nutrition score (simplified)
    const nutritionScore = calculateNutritionScore(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          height: user.height,
          weight: user.weight,
          activityLevel: user.activityLevel,
          goal: user.goal,
          bmr: user.bmr,
          tdee: user.tdee,
          targetCalories: user.targetCalories
        },
        nutritionScore,
        recommendations: getRecommendations(user)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard'
    });
  }
};

// Calculate nutrition score based on user profile
const calculateNutritionScore = (user) => {
  let score = 50; // Base score

  if (user.targetCalories) score += 10;
  if (user.bmr && user.tdee) score += 10;
  if (user.dietaryRestrictions && user.dietaryRestrictions.length > 0) score += 10;
  if (user.preferences) score += 10;
  if (user.weight && user.height && user.age) score += 10;

  return Math.min(100, score);
};

// Get personalized recommendations
const getRecommendations = (user) => {
  const recommendations = [];

  if (!user.targetCalories) {
    recommendations.push('Calculate your calorie requirements to get personalized meal plans');
  }

  if (user.goal === 'lose' && user.targetCalories > 2000) {
    recommendations.push('Consider reducing portion sizes or increasing activity level');
  }

  if (user.goal === 'gain' && user.targetCalories < 2500) {
    recommendations.push('Increase your calorie intake with nutrient-dense foods');
  }

  if (!user.dietaryRestrictions || user.dietaryRestrictions.length === 0) {
    recommendations.push('Add any dietary restrictions or allergies for better meal recommendations');
  }

  return recommendations;
};


