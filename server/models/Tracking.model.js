import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  meals: [{
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    foodName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0
    },
    servingSize: {
      type: String,
      default: '100g'
    },
    calories: {
      type: Number,
      required: true,
      min: 0
    },
    protein: {
      type: Number,
      default: 0
    },
    carbs: {
      type: Number,
      default: 0
    },
    fats: {
      type: Number,
      default: 0
    },
    imageUrl: {
      type: String
    }
  }],
  totalCalories: {
    type: Number,
    default: 0,
    min: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFats: {
    type: Number,
    default: 0
  },
  targetCalories: {
    type: Number,
    required: true
  },
  weight: {
    type: Number
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
trackingSchema.index({ user: 1, date: -1 });

export default mongoose.model('Tracking', trackingSchema);


