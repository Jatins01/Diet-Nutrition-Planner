/**
 * Calculate BMR (Basal Metabolic Rate) using Harris-Benedict equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in calories
 */
export const calculateBMR = (weight, height, age, gender) => {
  if (!weight || !height || !age || !gender) {
    throw new Error('Weight, height, age, and gender are required');
  }

  // Harris-Benedict equation
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else if (gender === 'female') {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  } else {
    // For 'other', use average
    return (88.362 + 447.593) / 2 + (13.397 + 9.247) / 2 * weight + 
           (4.799 + 3.098) / 2 * height - (5.677 + 4.330) / 2 * age;
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - BMR in calories
 * @param {string} activityLevel - Activity level
 * @returns {number} TDEE in calories
 */
export const calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    'sedentary': 1.2,      // Little or no exercise
    'light': 1.375,        // Light exercise 1-3 days/week
    'moderate': 1.55,      // Moderate exercise 3-5 days/week
    'active': 1.725,       // Hard exercise 6-7 days/week
    'very-active': 1.9     // Very hard exercise, physical job
  };

  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return bmr * multiplier;
};

/**
 * Calculate target calories based on goal
 * @param {number} tdee - TDEE in calories
 * @param {string} goal - 'lose', 'maintain', or 'gain'
 * @returns {number} Target calories
 */
export const calculateTargetCalories = (tdee, goal) => {
  const goalAdjustments = {
    'lose': -500,      // 500 calorie deficit for ~1 lb/week loss
    'maintain': 0,
    'gain': 500        // 500 calorie surplus for ~1 lb/week gain
  };

  const adjustment = goalAdjustments[goal] || 0;
  return Math.max(1200, tdee + adjustment); // Minimum 1200 calories for safety
};

/**
 * Calculate all calorie metrics for a user
 * @param {Object} userData - User data object
 * @returns {Object} Calorie calculations
 */
export const calculateAllCalories = (userData) => {
  const { weight, height, age, gender, activityLevel, goal } = userData;

  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = calculateTargetCalories(tdee, goal);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories)
  };
};


