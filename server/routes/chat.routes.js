import express from 'express';
import { nutritionAssistant } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/nutrition-assistant', protect, nutritionAssistant);

export default router;


