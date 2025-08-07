import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LoadingSpinner from '../components/LoadingSpinner'
import telegramWebApp from '../utils/telegram'
import {
  Play,
  Eye,
  RotateCcw,
  Briefcase,
  Gift,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react'

const SpinWheel = ({ onSpin, disabled, isSpinning }) => {
  const [rotation, setRotation] = useState(0)

  const handleSpin = () => {
    if (disabled || isSpinning) return
    
    const newRotation = rotation + 1440 + Math.random() * 360
    setRotation(newRotation)
    
    setTimeout(() => {
      onSpin()
    }, 2000)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div 
          className={`w-32 h-32 rounded-full border-8 border-gradient-to-r from-purple-500 to-pink-500 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 flex items-center justify-center transition-transform duration-2000 ease-out ${isSpinning ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="text-white font-bold text-lg">SPIN</div>
        </div>
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500"></div>
        </div>
      </div>
      
      <Button
        onClick={handleSpin}
        disabled={disabled || isSpinning}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        {isSpinning ? (
          <>
            <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
            Spinning...
          </>
        ) : (
          <>
            <Gift className="w-4 h-4 mr-2" />
            Spin to Win!
          </>
        )}
      </Button>
    </div>
  )
}

const EarnPage = () => {
  const { 
    user, 
    watchAd, 
    spinWheel, 
    completeCPA, 
    getEarningLimits 
  } = useAuth()
  
  const [limits, setLimits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adWatching, setAdWatching] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await getEarningLimits()
        if (response.success) {
          setLimits(response.limits)
        }
      } catch (error) {
        console.error('Failed to fetch limits:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchLimits()
    }
  }, [user, getEarningLimits])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleWatchAd = async () => {
    try {
      setAdWatching(true)
      
      // Simulate ad watching
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const response = await watchAd()
      if (response.success) {
        showMessage(response.message, 'success')
        // Refresh limits
        const limitsResponse = await getEarningLimits()
        if (limitsResponse.success) {
          setLimits(limitsResponse.limits)
        }
      }
    } catch (error) {
      showMessage(error.message || 'Failed to watch ad', 'error')
    } finally {
      setAdWatching(false)
    }
  }

  const handleSpin = async () => {
    try {
      setSpinning(true)
      
      const response = await spinWheel()
      if (response.success) {
        showMessage(response.message, 'success')
        // Refresh limits
        const limitsResponse = await getEarningLimits()
        if (limitsResponse.success) {
          setLimits(limitsResponse.limits)
        }
      }
    } catch (error) {
      showMessage(error.message || 'Failed to spin wheel', 'error')
    } finally {
      setSpinning(false)
    }
  }

  const handleCPAOffer = async (offerId, amount, description) => {
    try {
      const response = await completeCPA({
        offer_id: offerId,
        amount: amount,
        description: description
      })
      
      if (response.success) {
        showMessage(response.message, 'success')
      }
    } catch (error) {
      showMessage(error.message || 'Failed to complete offer', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const cpaOffers = [
    {
      id: 'offer1',
      title: 'Download Game App',
      description: 'Download and play for 5 minutes',
      reward: 25,
      icon: '🎮'
    },
    {
      id: 'offer2',
      title: 'Sign up for Newsletter',
      description: 'Subscribe to our partner newsletter',
      reward: 15,
      icon: '📧'
    },
    {
      id: 'offer3',
      title: 'Complete Survey',
      description: 'Answer 10 quick questions',
      reward: 35,
      icon: '📋'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Earn Money 💰</h1>
        <p className="text-gray-600">Choose your earning method</p>
      </div>

      {/* Message */}
      {message && (
        <Card className={`p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </Card>
      )}

      {/* Watch Ads Section */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <Eye className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Watch Video Ads</h2>
            <p className="text-gray-600">Earn ৳{limits?.ad_reward_amount?.value || '5'} for each ad you watch</p>
          </div>

          <div className="bg-white/60 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Remaining today: {limits?.ads?.remaining || 0}/{limits?.daily_ad_limit?.value || 30}</span>
            </div>
          </div>

          <Button
            onClick={handleWatchAd}
            disabled={adWatching || (limits?.ads?.remaining || 0) === 0}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            size="lg"
          >
            {adWatching ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Watching Ad...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Watch Ad (৳{limits?.ad_reward_amount?.value || 5})
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Spin Wheel Section */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Spin to Earn</h2>
            <p className="text-gray-600">Win ৳{limits?.spin_min_reward?.value || 1}-{limits?.spin_max_reward?.value || 50} with each spin!</p>
          </div>

          <div className="bg-white/60 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <RotateCcw className="w-4 h-4" />
              <span>Remaining today: {limits?.spins?.remaining || 0}/{limits?.daily_spin_limit?.value || 10}</span>
            </div>
          </div>

          <SpinWheel
            onSpin={handleSpin}
            disabled={(limits?.spins?.remaining || 0) === 0}
            isSpinning={spinning}
          />
        </div>
      </Card>

      {/* CPA Offers Section */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">CPA Offers</h2>
            <p className="text-gray-600">Complete tasks for higher rewards</p>
          </div>

          <div className="space-y-3">
            {cpaOffers.map((offer) => (
              <div key={offer.id} className="bg-white/60 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{offer.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                      <p className="text-sm text-gray-600">{offer.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">৳{offer.reward}</div>
                    <Button
                      size="sm"
                      onClick={() => handleCPAOffer(offer.id, offer.reward, offer.title)}
                      className="bg-green-500 hover:bg-green-600 text-xs"
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default EarnPage

