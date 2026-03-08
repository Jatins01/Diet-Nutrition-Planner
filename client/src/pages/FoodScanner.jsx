import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api'

const FoodScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setLoading(true)
    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      const response = await api.post('/food/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setResult(response.data.data)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error processing image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToLog = async () => {
    if (!result?.food?.id) return

    try {
      await api.post('/track/add', {
        mealType: 'snack',
        foodId: result.food.id,
        quantity: 1,
        imageUrl: preview,
      })
      alert('Food added to your log!')
    } catch (error) {
      console.error('Error adding to log:', error)
      alert('Error adding food to log.')
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Food Scanner</h1>
        <p className="text-gray-600">Upload a food image to get instant nutrition information</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Image</h2>

          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 transition-all duration-300"
            >
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                <button
                  onClick={() => {
                    setPreview(null)
                    setSelectedFile(null)
                    setResult(null)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>{loading ? 'Processing...' : 'Analyze Food'}</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Results</h2>

          {result ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    {result.prediction?.food_name || result.food?.name || 'Food Detected'}
                  </h3>
                </div>
                {result.prediction?.confidence && (
                  <p className="text-sm text-gray-600">
                    Confidence: {(result.prediction.confidence * 100).toFixed(1)}%
                  </p>
                )}
              </div>

              {result.food && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Nutrition Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Calories</p>
                      <p className="text-2xl font-bold text-blue-600">{result.food.calories}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Protein</p>
                      <p className="text-2xl font-bold text-purple-600">{result.food.protein}g</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Carbs</p>
                      <p className="text-2xl font-bold text-orange-600">{result.food.carbs}g</p>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Fats</p>
                      <p className="text-2xl font-bold text-pink-600">{result.food.fats}g</p>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToLog}
                    className="btn-primary w-full"
                  >
                    Add to Food Log
                  </button>
                </div>
              )}

              {!result.food && result.prediction && (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                    <p className="text-sm text-amber-800 font-medium mb-2">
                      Estimated nutrition for: {result.prediction.food_name}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Calories</p>
                        <p className="text-lg font-bold text-amber-600">{result.prediction.calories || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Protein</p>
                        <p className="text-lg font-bold text-amber-600">{result.prediction.protein || 0}g</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Carbs</p>
                        <p className="text-lg font-bold text-amber-600">{result.prediction.carbs || 0}g</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600">Fats</p>
                        <p className="text-lg font-bold text-amber-600">{result.prediction.fats || 0}g</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Upload an image to see results</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default FoodScanner


