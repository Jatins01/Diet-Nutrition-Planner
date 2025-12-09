import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import { Flame, Target, TrendingUp, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const Dashboard = () => {
  const { user } = useAuthStore()
  const [dashboardData, setDashboardData] = useState(null)
  const [progressData, setProgressData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchProgressData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/user/dashboard')
      setDashboardData(response.data.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProgressData = async () => {
    try {
      const response = await api.get('/track/progress?days=7')
      setProgressData(response.data.data || [])
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const stats = [
    {
      name: 'BMR',
      value: dashboardData?.user?.bmr || 0,
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      unit: 'cal',
    },
    {
      name: 'TDEE',
      value: dashboardData?.user?.tdee || 0,
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      unit: 'cal',
    },
    {
      name: 'Target Calories',
      value: dashboardData?.user?.targetCalories || 0,
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      unit: 'cal',
    },
    {
      name: 'Nutrition Score',
      value: dashboardData?.nutritionScore || 0,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      unit: '/100',
    },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600">Here's your nutrition overview</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stat.value}
                    <span className="text-lg text-gray-500 ml-1">{stat.unit}</span>
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Progress Chart */}
      {progressData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Weekly Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={2} name="Calories" />
              <Line type="monotone" dataKey="targetCalories" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recommendations */}
      {dashboardData?.recommendations && dashboardData.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommendations</h2>
          <ul className="space-y-2">
            {dashboardData.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard


