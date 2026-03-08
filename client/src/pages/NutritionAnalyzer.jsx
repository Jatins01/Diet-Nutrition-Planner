import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { Search, BarChart3, TrendingUp } from 'lucide-react'

const NutritionAnalyzer = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedFood, setSelectedFood] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setSearchResults([])
    setAnalysis(null)
    try {
      const response = await api.get(`/food/search?item=${encodeURIComponent(searchTerm.trim())}&limit=10`)
      const data = response.data?.data
      setSearchResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error searching:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async (foodId) => {
    if (!foodId) return
    setLoading(true)
    try {
      const response = await api.post('/food/nutrition', { foodId, quantity: 1 })
      const data = response.data?.data
      if (data) {
        setAnalysis(data)
        setSelectedFood(data.food)
      }
    } catch (error) {
      console.error('Error analyzing:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 border-green-300'
    if (score >= 60) return 'bg-blue-100 border-blue-300'
    if (score >= 40) return 'bg-yellow-100 border-yellow-300'
    return 'bg-red-100 border-red-300'
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Nutrition Analyzer</h1>
        <p className="text-gray-600">Search and analyze nutrition information for any food</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for food items..."
              className="input-field pl-12"
            />
          </div>
          <button onClick={handleSearch} disabled={loading} className="btn-primary">
            Search
          </button>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Search Results */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Results</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchResults.map((food) => (
                <div
                  key={food._id || food.id}
                  onClick={() => handleAnalyze(food._id || food.id)}
                  className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{food.name}</p>
                      <p className="text-sm text-gray-600">{food.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{food.calories} cal</p>
                      <p className="text-xs text-gray-500">{food.servingSize}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>{searchTerm.trim() ? 'No food items found. Try "apple", "chicken", or "rice"' : 'Search for food items to see results'}</p>
            </div>
          )}
        </motion.div>

        {/* Analysis Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis</h2>

          {analysis ? (
            <div className="space-y-6">
              {/* Score */}
              <div className={`rounded-xl p-6 border-2 ${getScoreBgColor(analysis.score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Nutrition Score</h3>
                  <BarChart3 className="w-6 h-6 text-gray-600" />
                </div>
                <p className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </p>
                <p className={`text-sm mt-2 ${getScoreColor(analysis.score)}`}>
                  {analysis.analysis?.status || 'Moderate'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {analysis.analysis?.message || 'Nutrition analysis complete'}
                </p>
              </div>

              {/* Macros */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Macronutrients</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Calories</p>
                    <p className="text-xl font-bold text-blue-600">
                      {Math.round(analysis.nutrition.calories)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Protein</p>
                    <p className="text-xl font-bold text-purple-600">
                      {Math.round(analysis.nutrition.protein)}g
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Carbs</p>
                    <p className="text-xl font-bold text-orange-600">
                      {Math.round(analysis.nutrition.carbs)}g
                    </p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Fats</p>
                    <p className="text-xl font-bold text-pink-600">
                      {Math.round(analysis.nutrition.fats)}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Food Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Food</p>
                <p className="font-semibold text-gray-800">{analysis.food.name}</p>
                <p className="text-xs text-gray-500 mt-1">Serving: {analysis.food.servingSize}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a food item to see analysis</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default NutritionAnalyzer


