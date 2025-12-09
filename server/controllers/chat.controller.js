import axios from 'axios';

// @desc    AI Nutrition Assistant Chat
// @route   POST /api/chat/nutrition-assistant
// @access  Private
export const nutritionAssistant = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    // Call ML service for chatbot response
    try {
      const mlResponse = await axios.post(`${process.env.ML_API_URL}/chat`, {
        message,
        context: context || {},
        user_id: req.user.id
      });

      res.json({
        success: true,
        data: {
          response: mlResponse.data.response,
          suggestions: mlResponse.data.suggestions || [],
          related_foods: mlResponse.data.related_foods || []
        }
      });
    } catch (mlError) {
      // Fallback response if ML service fails
      console.error('ML service error:', mlError.message);
      
      const fallbackResponse = generateFallbackResponse(message);
      
      res.json({
        success: true,
        data: {
          response: fallbackResponse,
          suggestions: [],
          related_foods: []
        },
        note: 'Using fallback response'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing chat message'
    });
  }
};

// Fallback response generator
const generateFallbackResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('calorie') || lowerMessage.includes('calories')) {
    return 'Calories are units of energy that your body uses for daily activities. To maintain weight, consume calories equal to your TDEE. To lose weight, create a calorie deficit of 500-1000 calories per day. To gain weight, add 300-500 calories to your TDEE.';
  }

  if (lowerMessage.includes('protein')) {
    return 'Protein is essential for muscle repair and growth. Aim for 0.8-1.2g of protein per kg of body weight. Good sources include chicken, fish, eggs, legumes, and dairy products.';
  }

  if (lowerMessage.includes('carb') || lowerMessage.includes('carbohydrate')) {
    return 'Carbohydrates are your body\'s primary energy source. Focus on complex carbs like whole grains, vegetables, and fruits. They provide sustained energy and fiber.';
  }

  if (lowerMessage.includes('fat') || lowerMessage.includes('fats')) {
    return 'Healthy fats are crucial for hormone production and nutrient absorption. Include sources like avocados, nuts, olive oil, and fatty fish. Aim for 20-30% of daily calories from fats.';
  }

  if (lowerMessage.includes('weight loss') || lowerMessage.includes('lose weight')) {
    return 'For weight loss, focus on creating a sustainable calorie deficit, eating nutrient-dense foods, staying hydrated, and maintaining regular physical activity. Remember, slow and steady progress is more sustainable.';
  }

  if (lowerMessage.includes('weight gain') || lowerMessage.includes('gain weight')) {
    return 'For healthy weight gain, increase your calorie intake with nutrient-rich foods. Focus on lean proteins, complex carbohydrates, and healthy fats. Consider strength training to build muscle mass.';
  }

  if (lowerMessage.includes('breakfast') || lowerMessage.includes('lunch') || lowerMessage.includes('dinner')) {
    return 'A balanced meal should include protein, carbohydrates, healthy fats, and vegetables. For breakfast, try eggs with whole grain toast. For lunch, include lean protein with vegetables and a complex carb. For dinner, similar balance with lighter portions.';
  }

  return 'I\'m here to help with your nutrition questions! I can provide information about calories, macronutrients, meal planning, and dietary advice. What would you like to know more about?';
};


