import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './layouts/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MealPlanner from './pages/MealPlanner'
import FoodScanner from './pages/FoodScanner'
import NutritionAnalyzer from './pages/NutritionAnalyzer'
import History from './pages/History'
import Chatbot from './pages/Chatbot'
import Profile from './pages/Profile'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/meal-planner"
          element={
            <PrivateRoute>
              <Layout>
                <MealPlanner />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/food-scanner"
          element={
            <PrivateRoute>
              <Layout>
                <FoodScanner />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/nutrition-analyzer"
          element={
            <PrivateRoute>
              <Layout>
                <NutritionAnalyzer />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <Layout>
                <History />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <PrivateRoute>
              <Layout>
                <Chatbot />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App


