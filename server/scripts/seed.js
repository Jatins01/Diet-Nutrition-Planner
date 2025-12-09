import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Food from '../models/Food.model.js';

dotenv.config();

const sampleFoods = [
  {
    name: 'Oatmeal with Berries',
    category: 'breakfast',
    calories: 300,
    protein: 10,
    carbs: 50,
    fats: 5,
    fiber: 8,
    vegetarian: true,
    vegan: true,
    tags: ['healthy', 'fiber', 'antioxidants'],
    servingSize: '1 bowl'
  },
  {
    name: 'Grilled Chicken Breast',
    category: 'lunch',
    calories: 231,
    protein: 43,
    carbs: 0,
    fats: 5,
    fiber: 0,
    vegetarian: false,
    vegan: false,
    tags: ['high-protein', 'lean', 'low-carb'],
    servingSize: '150g'
  },
  {
    name: 'Salmon with Vegetables',
    category: 'dinner',
    calories: 350,
    protein: 35,
    carbs: 15,
    fats: 18,
    fiber: 5,
    vegetarian: false,
    vegan: false,
    tags: ['omega-3', 'healthy-fats', 'protein'],
    servingSize: '200g'
  },
  {
    name: 'Greek Yogurt',
    category: 'snack',
    calories: 100,
    protein: 17,
    carbs: 6,
    fats: 0,
    fiber: 0,
    vegetarian: true,
    vegan: false,
    tags: ['protein', 'probiotics', 'calcium'],
    servingSize: '100g'
  },
  {
    name: 'Quinoa Salad',
    category: 'lunch',
    calories: 250,
    protein: 8,
    carbs: 45,
    fats: 6,
    fiber: 5,
    vegetarian: true,
    vegan: true,
    tags: ['complete-protein', 'fiber', 'gluten-free'],
    servingSize: '150g'
  },
  {
    name: 'Scrambled Eggs',
    category: 'breakfast',
    calories: 200,
    protein: 14,
    carbs: 2,
    fats: 15,
    fiber: 0,
    vegetarian: true,
    vegan: false,
    tags: ['protein', 'vitamins', 'choline'],
    servingSize: '2 eggs'
  },
  {
    name: 'Brown Rice with Vegetables',
    category: 'dinner',
    calories: 220,
    protein: 5,
    carbs: 45,
    fats: 2,
    fiber: 4,
    vegetarian: true,
    vegan: true,
    tags: ['fiber', 'complex-carbs', 'vitamins'],
    servingSize: '150g'
  },
  {
    name: 'Almonds',
    category: 'snack',
    calories: 160,
    protein: 6,
    carbs: 6,
    fats: 14,
    fiber: 3,
    vegetarian: true,
    vegan: true,
    tags: ['healthy-fats', 'protein', 'vitamin-e'],
    servingSize: '30g'
  },
  {
    name: 'Apple',
    category: 'snack',
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fats: 0.2,
    fiber: 2.4,
    vegetarian: true,
    vegan: true,
    tags: ['fiber', 'antioxidants', 'vitamins'],
    servingSize: '1 medium'
  },
  {
    name: 'Banana',
    category: 'snack',
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fats: 0.3,
    fiber: 2.6,
    vegetarian: true,
    vegan: true,
    tags: ['potassium', 'energy', 'fiber'],
    servingSize: '1 medium'
  }
];

const seedFoods = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/diet-planner');
    console.log('✅ Connected to MongoDB');

    // Clear existing foods
    await Food.deleteMany({});
    console.log('✅ Cleared existing foods');

    // Insert sample foods
    await Food.insertMany(sampleFoods);
    console.log(`✅ Seeded ${sampleFoods.length} foods`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding foods:', error);
    process.exit(1);
  }
};

seedFoods();


