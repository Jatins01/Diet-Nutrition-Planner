import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            loading: false,
          })
          // Set token in API client
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
          return { success: true }
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            loading: false,
          })
          return { success: false, error: error.response?.data?.message || 'Login failed' }
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/register', userData)
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
            loading: false,
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
          return { success: true }
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            loading: false,
          })
          return { success: false, error: error.response?.data?.message || 'Registration failed' }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        delete api.defaults.headers.common['Authorization']
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      initialize: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ isAuthenticated: true })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
