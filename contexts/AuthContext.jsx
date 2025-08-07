import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const API_BASE_URL = '/api';
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body)
    }

    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'API request failed')
    }

    return data
  }

  // Register new user
  const register = async (userData) => {
    try {
      setLoading(true)
      
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: userData,
      })

      if (response.success) {
        setUser(response.user)
        return response.user
      }
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Login with username and password
  const login = async (credentials) => {
    try {
      setLoading(true)
      
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: credentials,
      })

      if (response.success) {
        setUser(response.user)
        return response.user
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Get current user
  const getCurrentUser = async () => {
    try {
      const userResponse = await apiCall("/auth/me")
      const configResponse = await apiCall("/admin/settings")

      if (userResponse.success && configResponse.success) {
        setUser({
          ...userResponse.user,
          min_withdrawal_amount: configResponse.settings.min_withdrawal_amount.value,
          ad_reward_amount: configResponse.settings.ad_reward_amount.value,
          daily_ad_limit: configResponse.settings.daily_ad_limit.value,
          daily_spin_limit: configResponse.settings.daily_spin_limit.value,
          spin_min_reward: configResponse.settings.spin_min_reward.value,
          spin_max_reward: configResponse.settings.spin_max_reward.value,
        })
        return userResponse.user
      }
    } catch (error) {
      console.error("Failed to get current user:", error)
      setUser(null)
    }
  }

  // Logout
  const logout = async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' })
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    await getCurrentUser()
  }

  // Earning methods
  const watchAd = async () => {
    const response = await apiCall('/earnings/watch-ad', { method: 'POST' })
    if (response.success) {
      await refreshUser() // Refresh user balance
    }
    return response
  }

  const completeCPA = async (offerData) => {
    const response = await apiCall('/earnings/complete-cpa', {
      method: 'POST',
      body: offerData,
    })
    if (response.success) {
      await refreshUser()
    }
    return response
  }

  const spinWheel = async () => {
    const response = await apiCall('/earnings/spin', { method: 'POST' })
    if (response.success) {
      await refreshUser()
    }
    return response
  }

  // Get earning limits
  const getEarningLimits = async () => {
    return await apiCall('/earnings/limits')
  }

  // Get earnings history
  const getEarningsHistory = async (page = 1, perPage = 20) => {
    return await apiCall(`/earnings/history?page=${page}&per_page=${perPage}`)
  }

  // Get earnings stats
  const getEarningsStats = async () => {
    return await apiCall('/earnings/stats')
  }

  // Withdrawal methods
  const requestWithdrawal = async (withdrawalData) => {
    const response = await apiCall('/withdrawals/request', {
      method: 'POST',
      body: withdrawalData,
    })
    if (response.success) {
      await refreshUser() // Refresh user balance
    }
    return response
  }

  const getWithdrawalHistory = async (page = 1, perPage = 20) => {
    return await apiCall(`/withdrawals/history?page=${page}&per_page=${perPage}`)
  }

  const cancelWithdrawal = async (withdrawalId) => {
    const response = await apiCall(`/withdrawals/cancel/${withdrawalId}`, {
      method: 'POST',
    })
    if (response.success) {
      await refreshUser()
    }
    return response
  }

  // Admin methods
  const adminLogin = async (credentials) => {
    return await apiCall('/admin/login', {
      method: 'POST',
      body: credentials,
    })
  }

  const getAdminStats = async () => {
    return await apiCall('/admin/stats')
  }

  const getAllWithdrawals = async (page = 1, perPage = 20, status = '') => {
    const params = new URLSearchParams({ page, per_page: perPage })
    if (status) params.append('status', status)
    return await apiCall(`/admin/withdrawals?${params}`)
  }

  const updateWithdrawalStatus = async (withdrawalId, statusData) => {
    return await apiCall(`/admin/withdrawals/${withdrawalId}`, {
      method: 'PUT',
      body: statusData,
    })
  }

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        await getCurrentUser()
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    refreshUser,
    // Earning methods
    watchAd,
    completeCPA,
    spinWheel,
    getEarningLimits,
    getEarningsHistory,
    getEarningsStats,
    // Withdrawal methods
    requestWithdrawal,
    getWithdrawalHistory,
    cancelWithdrawal,
    // Admin methods
    adminLogin,
    getAdminStats,
    getAllWithdrawals,
    updateWithdrawalStatus,
    // API helper
    apiCall,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

