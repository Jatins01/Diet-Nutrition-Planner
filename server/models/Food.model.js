import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'beverage'],
    default: 'snack'
  },
  calories: {
    type: Number,
    required: true,
    min: 0
  },
  protein: {
    type: Number, // in grams
    default: 0,
    min: 0
  },
  carbs: {
    type: Number, // in grams
    default: 0,
    min: 0
  },
  fats: {
    type: Number, // in grams
    default: 0,
    min: 0
  },
  fiber: {
    type: Number, // in grams
    default: 0,
    min: 0
  },
  vitamins: {
    A: { type: Number, default: 0 },
    B1: { type: Number, default: 0 },
    B2: { type: Number, default: 0 },
    B3: { type: Number, default: 0 },
    B6: { type: Number, default: 0 },
    B12: { type: Number, default: 0 },
    C: { type: Number, default: 0 },
    D: { type: Number, default: 0 },
    E: { type: Number, default: 0 },
    K: { type: Number, default: 0 }
  },
  minerals: {
    calcium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 },
    phosphorus: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    zinc: { type: Number, default: 0 }
  },
  servingSize: {
    type: String,
    default: '100g'
  },
  image: {
    type: String
  },
  tags: [{
    type: String
  }],
  vegetarian: {
    type: Boolean,
    default: true
  },
  vegan: {
    type: Boolean,
    default: false
  },
  glutenFree: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search
foodSchema.index({ name: 'text', tags: 'text' });

export default mongoose.model('Food', foodSchema);


