import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LoadingSpinner from './LoadingSpinner'
import telegramWebApp from '../utils/telegram'
import {
  MessageCircle,
  Smartphone,
  Shield,
  AlertCircle,
  ExternalLink,
  Settings
} from 'lucide-react'

const TelegramLoginPrompt = () => {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAdminLink, setShowAdminLink] = useState(false)

  useEffect(() => {
    // Auto-attempt login if in Telegram
    if (telegramWebApp.isInTelegram()) {
      handleTelegramLogin()
    }
  }, [])

  const handleTelegramLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await login()
      
      // Success feedback
      if (telegramWebApp.isInTelegram()) {
        telegramWebApp.notificationOccurred('success')
      }
    } catch (error) {
      console.error('Telegram login failed:', error)
      setError('Failed to connect with Telegram. Please try again.')
      
      if (telegramWebApp.isInTelegram()) {
        telegramWebApp.notificationOccurred('error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // This will create a random user profile
      await login()
      
    } catch (error) {
      console.error('Demo login failed:', error)
      setError('Demo login failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRetryLogin = () => {
    handleTelegramLogin()
  }

  const toggleAdminLink = () => {
    setShowAdminLink(!showAdminLink)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">
            {telegramWebApp.isInTelegram() ? 'Connecting to Telegram...' : 'Initializing...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Login Card */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <div className="text-center space-y-6">
            {/* App Logo/Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            
            {/* App Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Telegram Mini App
              </h1>
              <p className="text-gray-600">
                Earn Money Daily 💰
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Login Instructions */}
            <div className="space-y-4">
              {telegramWebApp.isInTelegram() ? (
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center justify-center space-x-2 text-green-700">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Running in Telegram</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleDemoLogin}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 mb-2"
                    size="lg"
                  >
                    🚀 Demo Login (Random Profile)
                  </Button>

                  <Button
                    onClick={handleRetryLogin}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Connect with Telegram
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-left">
                        <p className="font-medium text-blue-900 mb-1">
                          Open in Telegram
                        </p>
                        <p className="text-sm text-blue-700">
                          This app is designed to work inside Telegram. Please open it through your Telegram bot.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>How to access:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-left">
                      <li>Open Telegram app</li>
                      <li>Find your bot</li>
                      <li>Start the bot and open the Mini App</li>
                    </ol>
                  </div>

                  <Button
                    onClick={handleDemoLogin}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 mb-2"
                    size="lg"
                  >
                    🚀 Demo Login (Random Profile)
                  </Button>

                  <Button
                    onClick={handleTelegramLogin}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Try to Connect Anyway
                  </Button>
                </div>
              )}
            </div>

            {/* Features Preview */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">What you can do:</p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-1">
                    <span className="text-green-600">💰</span>
                  </div>
                  <span className="text-gray-600">Watch Ads</span>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-1">
                    <span className="text-purple-600">🎯</span>
                  </div>
                  <span className="text-gray-600">Complete Tasks</span>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-1">
                    <span className="text-blue-600">💳</span>
                  </div>
                  <span className="text-gray-600">Withdraw</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Admin Access */}
        <div className="text-center">
          <Button
            onClick={toggleAdminLink}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings className="w-4 h-4 mr-1" />
            Admin Access
          </Button>
          
          {showAdminLink && (
            <div className="mt-2">
              <a
                href="/admin/login"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Go to Admin Panel
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TelegramLoginPrompt

