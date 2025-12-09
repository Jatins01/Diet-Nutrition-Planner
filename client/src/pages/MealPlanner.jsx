import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { Calendar, UtensilsCrossed, Plus } from 'lucide-react'

const MealPlanner = () => {
  const [mealPlan, setMealPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    generateMealPlan()
  }, [date])

  const generateMealPlan = async () => {
    setLoading(true)
    try {
      const response = await api.post('/diet/generate-plan', { date, type: 'daily' })
      setMealPlan(response.data.data)
    } catch (error) {
      console.error('Error generating meal plan:', error)
      alert('Error generating meal plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']
  const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Meal Planner</h1>
          <p className="text-gray-600">Your personalized AI-generated meal plan</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
          <button
            onClick={generateMealPlan}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{loading ? 'Generating...' : 'Generate Plan'}</span>
          </button>
        </div>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Generating your personalized meal plan...</div>
        </div>
      )}

      {mealPlan && !loading && (
        <>
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card bg-gradient-to-r from-blue-50 to-purple-50"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Calories</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(mealPlan.totalCalories)} / {mealPlan.targetCalories}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Protein</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(mealPlan.totalProtein)}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Carbs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(mealPlan.totalCarbs)}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Fats</p>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round(mealPlan.totalFats)}g
                </p>
              </div>
            </div>
          </motion.div>

          {/* Meals */}
          <div className="grid md:grid-cols-2 gap-6">
            {mealTypes.map((mealType, index) => {
              const meal = mealPlan.meals?.find((m) => m.mealType === mealType)
              return (
                <motion.div
                  key={mealType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <UtensilsCrossed className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{mealLabels[mealType]}</h3>
                  </div>

                  {meal ? (
                    <div className="space-y-4">
                      {meal.foods?.map((foodItem, idx) => {
                        const food = foodItem.food
                        return (
                          <div key={idx} className="border-l-4 border-blue-500 pl-4">
                            <p className="font-semibold text-gray-800">{food?.name || 'Food item'}</p>
                            <p className="text-sm text-gray-600">
                              {foodItem.quantity}x {foodItem.servingSize}
                            </p>
                            <p className="text-sm text-blue-600 font-medium">
                              {food?.calories ? Math.round(food.calories * foodItem.quantity) : 0} cal
                            </p>
                          </div>
                        )
                      })}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          Total: {Math.round(meal.totalCalories)} cal | P: {Math.round(meal.totalProtein)}g | C: {Math.round(meal.totalCarbs)}g | F: {Math.round(meal.totalFats)}g
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No meal planned</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </>
      )}

      {!mealPlan && !loading && (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Click "Generate Plan" to create your personalized meal plan</p>
        </div>
      )}
    </div>
  )
}

export default MealPlanner


