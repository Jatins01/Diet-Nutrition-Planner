import express from 'express';
import { calculateCalories, generateMealPlan, getWeeklyPlan } from '../controllers/diet.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/calculate-calories', protect, calculateCalories);
router.post('/generate-plan', protect, generateMealPlan);
router.get('/weekly-plan', protect, getWeeklyPlan);

export default router;


