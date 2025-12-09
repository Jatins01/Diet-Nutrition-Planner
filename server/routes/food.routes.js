import express from 'express';
import { uploadImage, searchFood, analyzeNutrition, upload } from '../controllers/food.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/upload-image', protect, upload.single('image'), uploadImage);
router.get('/search', protect, searchFood);
router.post('/nutrition', protect, analyzeNutrition);

export default router;


