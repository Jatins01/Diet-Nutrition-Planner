import Food from '../models/Food.model.js';
import Tracking from '../models/Tracking.model.js';
import axios from 'axios';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @desc    Upload food image and get prediction
// @route   POST /api/food/upload-image
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Convert image to base64 for ML service
    const imageBase64 = req.file.buffer.toString('base64');
    const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;

    // Call ML service for food recognition
    try {
      const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict-food`, {
        image: imageData
      });

      const prediction = mlResponse.data;

      // Find or create food in database
      let food = await Food.findOne({ name: { $regex: new RegExp(prediction.food_name, 'i') } });
      
      if (!food && prediction.calories) {
        // Create food entry if not exists
        food = await Food.create({
          name: prediction.food_name,
          calories: prediction.calories || 0,
          protein: prediction.protein || 0,
          carbs: prediction.carbs || 0,
          fats: prediction.fats || 0,
          category: 'snack',
          image: imageData
        });
      }

      res.json({
        success: true,
        data: {
          food: food ? {
            id: food._id,
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fats: food.fats
          } : null,
          prediction: {
            food_name: prediction.food_name,
            confidence: prediction.confidence,
            calories: prediction.calories,
            nutrition: prediction.nutrition
          }
        }
      });
    } catch (mlError) {
      console.error('ML service error:', mlError.message);
      res.status(500).json({
        success: false,
        message: 'Error processing image. Please try again.',
        error: process.env.NODE_ENV === 'development' ? mlError.message : undefined
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading image'
    });
  }
};

// @desc    Search food items
// @route   GET /api/food/search
// @access  Private
export const searchFood = async (req, res) => {
  try {
    const { item, limit = 20 } = req.query;

    if (!item) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search term'
      });
    }

    const foods = await Food.find({
      $text: { $search: item },
      isActive: true
    })
    .limit(parseInt(limit))
    .select('name calories protein carbs fats category servingSize image');

    res.json({
      success: true,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching food'
    });
  }
};

// @desc    Get nutrition analysis
// @route   POST /api/food/nutrition
// @access  Private
export const analyzeNutrition = async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide food ID'
      });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    // Calculate nutrition based on quantity
    const nutrition = {
      calories: food.calories * quantity,
      protein: food.protein * quantity,
      carbs: food.carbs * quantity,
      fats: food.fats * quantity,
      fiber: food.fiber * quantity,
      vitamins: {},
      minerals: {}
    };

    // Scale vitamins and minerals
    Object.keys(food.vitamins).forEach(vit => {
      nutrition.vitamins[vit] = food.vitamins[vit] * quantity;
    });

    Object.keys(food.minerals).forEach(min => {
      nutrition.minerals[min] = food.minerals[min] * quantity;
    });

    // Calculate nutrition score
    const score = calculateNutritionScore(nutrition);

    res.json({
      success: true,
      data: {
        food: {
          id: food._id,
          name: food.name,
          servingSize: food.servingSize
        },
        quantity,
        nutrition,
        score,
        analysis: getNutritionAnalysis(nutrition, score)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error analyzing nutrition'
    });
  }
};

// Calculate nutrition score (0-100)
const calculateNutritionScore = (nutrition) => {
  let score = 100;

  // Penalize high calories without nutrients
  if (nutrition.calories > 500 && nutrition.protein < 20) {
    score -= 20;
  }

  // Reward balanced macros
  const totalMacros = nutrition.protein + nutrition.carbs + nutrition.fats;
  if (totalMacros > 0) {
    const proteinRatio = nutrition.protein / totalMacros;
    const carbsRatio = nutrition.carbs / totalMacros;
    const fatsRatio = nutrition.fats / totalMacros;

    // Ideal ratios: Protein 20-30%, Carbs 40-50%, Fats 20-30%
    if (proteinRatio >= 0.2 && proteinRatio <= 0.3) score += 10;
    if (carbsRatio >= 0.4 && carbsRatio <= 0.5) score += 10;
    if (fatsRatio >= 0.2 && fatsRatio <= 0.3) score += 10;
  }

  // Reward fiber
  if (nutrition.fiber > 5) score += 10;

  // Reward vitamins
  const vitaminCount = Object.values(nutrition.vitamins).filter(v => v > 0).length;
  if (vitaminCount > 3) score += 10;

  return Math.min(100, Math.max(0, score));
};

// Get nutrition analysis text
const getNutritionAnalysis = (nutrition, score) => {
  if (score >= 80) {
    return {
      status: 'Excellent',
      message: 'This is a highly nutritious food with balanced macros and good vitamin content.',
      color: 'green'
    };
  } else if (score >= 60) {
    return {
      status: 'Good',
      message: 'This food provides decent nutrition. Consider adding more protein or fiber.',
      color: 'blue'
    };
  } else if (score >= 40) {
    return {
      status: 'Moderate',
      message: 'This food is moderate in nutrition. Try to balance with healthier options.',
      color: 'yellow'
    };
  } else {
    return {
      status: 'Low',
      message: 'This food is high in calories but low in nutrients. Consider healthier alternatives.',
      color: 'red'
    };
  }
};


