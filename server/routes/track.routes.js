import express from 'express';
import { addTracking, getHistory, getProgress } from '../controllers/track.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/add', protect, addTracking);
router.get('/history', protect, getHistory);
router.get('/progress', protect, getProgress);

export default router;


