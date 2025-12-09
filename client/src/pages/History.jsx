import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../services/api'
import { Calendar, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const History = () => {
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await api.get('/track/history?limit=30')
      setHistory(response.data.data)
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">History</h1>
        <p className="text-gray-600">Track your nutrition journey over time</p>
      </motion.div>

      {/* Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-1">Total Days</p>
            <p className="text-3xl font-bold text-gray-800">{stats.totalDays}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-1">Avg Calories</p>
            <p className="text-3xl font-bold text-blue-600">{Math.round(stats.averageCalories)}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-1">Avg Protein</p>
            <p className="text-3xl font-bold text-purple-600">{Math.round(stats.averageProtein)}g</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600 mb-1">Avg Carbs</p>
            <p className="text-3xl font-bold text-orange-600">{Math.round(stats.averageCarbs)}g</p>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Calorie Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="totalCalories"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Calories"
              />
              <Line
                type="monotone"
                dataKey="targetCalories"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* History List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Entries</h2>
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry._id}
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <p className="font-semibold text-gray-800">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {Math.round(entry.totalCalories)} / {entry.targetCalories} cal
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.meals?.length || 0} meals
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Protein: </span>
                    <span className="font-semibold text-purple-600">
                      {Math.round(entry.totalProtein)}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbs: </span>
                    <span className="font-semibold text-orange-600">
                      {Math.round(entry.totalCarbs)}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fats: </span>
                    <span className="font-semibold text-pink-600">
                      {Math.round(entry.totalFats)}g
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No history yet. Start tracking your meals!</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default History


