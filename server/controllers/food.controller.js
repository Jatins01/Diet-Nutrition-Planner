import Food from '../models/Food.model.js';
import Tracking from '../models/Tracking.model.js';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import FormData from 'form-data';

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

// Extended nutrition data for accurate food recognition fallback
const FOOD_NUTRITION_MAP = {
  apple: { calories: 52, protein: 0.3, carbs: 14, fats: 0.2 },
  banana: { calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
  bread: { calories: 265, protein: 9, carbs: 49, fats: 3.2 },
  burger: { calories: 295, protein: 15, carbs: 30, fats: 12 },
  hamburger: { calories: 295, protein: 15, carbs: 30, fats: 12 },
  cake: { calories: 350, protein: 4, carbs: 50, fats: 15 },
  chicken: { calories: 231, protein: 43, carbs: 0, fats: 5 },
  coffee: { calories: 2, protein: 0.1, carbs: 0, fats: 0 },
  egg: { calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  eggs: { calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  fish: { calories: 206, protein: 22, carbs: 0, fats: 12 },
  salmon: { calories: 208, protein: 20, carbs: 0, fats: 13 },
  fries: { calories: 312, protein: 3.4, carbs: 41, fats: 15 },
  'ice cream': { calories: 207, protein: 3.5, carbs: 24, fats: 11 },
  pasta: { calories: 131, protein: 5, carbs: 25, fats: 1.1 },
  pizza: { calories: 266, protein: 11, carbs: 33, fats: 10 },
  rice: { calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  salad: { calories: 20, protein: 1, carbs: 4, fats: 0.2 },
  sandwich: { calories: 250, protein: 10, carbs: 30, fats: 8 },
  soup: { calories: 50, protein: 2, carbs: 8, fats: 1 },
  steak: { calories: 271, protein: 25, carbs: 0, fats: 19 },
  oatmeal: { calories: 300, protein: 10, carbs: 50, fats: 5 },
  yogurt: { calories: 100, protein: 17, carbs: 6, fats: 0 },
  almonds: { calories: 160, protein: 6, carbs: 6, fats: 14 },
  default: { calories: 250, protein: 12, carbs: 30, fats: 8 }
};

const getNutritionFromName = (name) => {
  const key = (name || '').toLowerCase().replace(/\s+/g, ' ').trim();
  return FOOD_NUTRITION_MAP[key] || FOOD_NUTRITION_MAP[Object.keys(FOOD_NUTRITION_MAP).find(k => key.includes(k))] || FOOD_NUTRITION_MAP.default;
};

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

    const imageBase64 = req.file.buffer.toString('base64');
    const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;
    let prediction = null;

    // 1) Try Spoonacular (real food recognition) if API key is set
    if (process.env.SPOONACULAR_API_KEY) {
      try {
        const form = new FormData();
        form.append('file', req.file.buffer, { filename: 'food.jpg', contentType: req.file.mimetype });
        const spoonRes = await axios.post(
          `https://api.spoonacular.com/food/images/analyze?apiKey=${process.env.SPOONACULAR_API_KEY}`,
          form,
          { headers: form.getHeaders(), timeout: 12000, maxContentLength: Infinity, maxBodyLength: Infinity }
        );
        const data = spoonRes.data;
        const category = data?.category?.name || 'food';
        const prob = data?.category?.probability ?? 0.9;
        const nut = data?.nutrition || {};
        const cal = nut.calories?.value ?? getNutritionFromName(category).calories;
        const protein = nut.protein?.value ?? getNutritionFromName(category).protein;
        const carbs = nut.carbs?.value ?? getNutritionFromName(category).carbs;
        const fats = nut.fat?.value ?? getNutritionFromName(category).fats;
        prediction = {
          food_name: category.charAt(0).toUpperCase() + category.slice(1),
          confidence: typeof prob === 'number' ? prob : 0.9,
          calories: Math.round(Number(cal) || 0),
          protein: Math.round(Number(protein) || 0),
          carbs: Math.round(Number(carbs) || 0),
          fats: Math.round(Number(fats) || 0),
          nutrition: { calories: Math.round(Number(cal) || 0), protein: Math.round(Number(protein) || 0), carbs: Math.round(Number(carbs) || 0), fats: Math.round(Number(fats) || 0) }
        };
      } catch (spoonErr) {
        console.error('Spoonacular API error:', spoonErr.response?.data || spoonErr.message);
      }
    }

    // 2) Try ML service if no Spoonacular result
    if (!prediction) {
      try {
        const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict-food`, {
          image: imageData
        }, { timeout: 15000 });
        prediction = mlResponse.data;
      } catch (mlError) {
        console.error('ML service error:', mlError.message);
      }
    }

    // 3) Fallback: use nutrition map by name or generic
    if (!prediction) {
      const nutrition = FOOD_NUTRITION_MAP.burger;
      prediction = {
        food_name: 'Food Item',
        confidence: 0.7,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fats: nutrition.fats,
        nutrition
      };
    }

    // Find or create food in database
    let food = await Food.findOne({ name: { $regex: new RegExp(prediction.food_name, 'i') } });
    if (!food && prediction.calories) {
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
          protein: prediction.protein,
          carbs: prediction.carbs,
          fats: prediction.fats,
          nutrition: prediction.nutrition || { calories: prediction.calories, protein: prediction.protein, carbs: prediction.carbs, fats: prediction.fats }
        }
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
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

    if (!item || !String(item).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search term'
      });
    }

    const searchTerm = String(item).trim();
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const foods = await Food.find({
      $or: [
        { name: regex },
        { tags: regex },
        { category: regex }
      ],
      isActive: true
    })
    .limit(parseInt(limit) || 20)
    .select('name calories protein carbs fats category servingSize image');

    res.json({
      success: true,
      data: foods
    });
  } catch (error) {
    console.error('Search food error:', error);
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
    if (food.vitamins && typeof food.vitamins === 'object') {
      Object.keys(food.vitamins).forEach(vit => {
        nutrition.vitamins[vit] = (food.vitamins[vit] || 0) * quantity;
      });
    }
    if (food.minerals && typeof food.minerals === 'object') {
      Object.keys(food.minerals).forEach(min => {
        nutrition.minerals[min] = (food.minerals[min] || 0) * quantity;
      });
    }

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


