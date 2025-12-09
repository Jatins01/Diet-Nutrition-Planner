import Tracking from '../models/Tracking.model.js';
import Food from '../models/Food.model.js';
import User from '../models/User.model.js';

// @desc    Add food to tracking
// @route   POST /api/track/add
// @access  Private
export const addTracking = async (req, res) => {
  try {
    const { date, mealType, foodId, quantity = 1, servingSize, imageUrl } = req.body;
    const userId = req.user.id;

    if (!mealType || !foodId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mealType and foodId'
      });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    const user = await User.findById(userId);
    const trackingDate = date ? new Date(date) : new Date();
    trackingDate.setHours(0, 0, 0, 0);

    // Find or create tracking entry for the date
    let tracking = await Tracking.findOne({
      user: userId,
      date: trackingDate
    });

    if (!tracking) {
      tracking = await Tracking.create({
        user: userId,
        date: trackingDate,
        targetCalories: user.targetCalories || 2000,
        meals: []
      });
    }

    // Add meal entry
    const mealEntry = {
      mealType,
      food: foodId,
      foodName: food.name,
      quantity,
      servingSize: servingSize || food.servingSize,
      calories: food.calories * quantity,
      protein: food.protein * quantity,
      carbs: food.carbs * quantity,
      fats: food.fats * quantity,
      ...(imageUrl && { imageUrl })
    };

    tracking.meals.push(mealEntry);

    // Recalculate totals
    tracking.totalCalories = tracking.meals.reduce((sum, m) => sum + m.calories, 0);
    tracking.totalProtein = tracking.meals.reduce((sum, m) => sum + m.protein, 0);
    tracking.totalCarbs = tracking.meals.reduce((sum, m) => sum + m.carbs, 0);
    tracking.totalFats = tracking.meals.reduce((sum, m) => sum + m.fats, 0);

    await tracking.save();

    res.json({
      success: true,
      data: tracking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding tracking entry'
    });
  }
};

// @desc    Get tracking history
// @route   GET /api/track/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, limit = 30 } = req.query;

    const query = { user: userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const tracking = await Tracking.find(query)
      .populate('meals.food', 'name calories protein carbs fats image')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Calculate statistics
    const stats = {
      totalDays: tracking.length,
      averageCalories: tracking.length > 0
        ? tracking.reduce((sum, t) => sum + t.totalCalories, 0) / tracking.length
        : 0,
      averageProtein: tracking.length > 0
        ? tracking.reduce((sum, t) => sum + t.totalProtein, 0) / tracking.length
        : 0,
      averageCarbs: tracking.length > 0
        ? tracking.reduce((sum, t) => sum + t.totalCarbs, 0) / tracking.length
        : 0,
      averageFats: tracking.length > 0
        ? tracking.reduce((sum, t) => sum + t.totalFats, 0) / tracking.length
        : 0
    };

    res.json({
      success: true,
      data: tracking,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching history'
    });
  }
};

// @desc    Get progress data for charts
// @route   GET /api/track/progress
// @access  Private
export const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const tracking = await Tracking.find({
      user: userId,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Format data for charts
    const chartData = tracking.map(t => ({
      date: t.date.toISOString().split('T')[0],
      calories: t.totalCalories,
      targetCalories: t.targetCalories,
      protein: t.totalProtein,
      carbs: t.totalCarbs,
      fats: t.totalFats,
      weight: t.weight
    }));

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching progress'
    });
  }
};


