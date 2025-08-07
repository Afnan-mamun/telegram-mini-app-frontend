import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  Play,
  Gift,
  CreditCard,
  TrendingUp,
  Eye,
  RotateCcw,
  Briefcase,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const Dashboard = () => {
  const { user, getEarningLimits, getEarningsStats } = useAuth()
  const [limits, setLimits] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [limitsData, statsData] = await Promise.all([
          getEarningLimits(),
          getEarningsStats()
        ])
        
        if (limitsData.success) setLimits(limitsData.limits)
        if (statsData.success) setStats(statsData.stats)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, getEarningLimits, getEarningsStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const quickActions = [
    {
      title: 'Watch Ads',
      description: `${limits?.ads?.remaining || 0} ads remaining`,
      icon: Eye,
      color: 'from-blue-500 to-blue-600',
      link: '/earn',
      disabled: (limits?.ads?.remaining || 0) === 0
    },
    {
      title: 'Spin Wheel',
      description: `${limits?.spins?.remaining || 0} spins left`,
      icon: RotateCcw,
      color: 'from-purple-500 to-purple-600',
      link: '/earn',
      disabled: (limits?.spins?.remaining || 0) === 0
    },
    {
      title: 'CPA Offers',
      description: 'Complete tasks',
      icon: Briefcase,
      color: 'from-green-500 to-green-600',
      link: '/earn',
      disabled: false
    },
    {
      title: 'Withdraw',
      description: 'Cash out earnings',
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600',
      link: '/withdraw',
      disabled: (user?.balance || 0) < 100
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          Ready to earn some money today?
        </p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-xl">
        <div className="p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Total Balance</span>
          </div>
          <div className="text-3xl font-bold mb-1">
            ৳{user?.balance?.toFixed(2) || '0.00'}
          </div>
          <p className="text-sm opacity-80">
            Keep earning to increase your balance!
          </p>
        </div>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-lg font-semibold text-gray-900">
                  ৳{stats.total_earned?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Play className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Activity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(stats.today?.ads_watched || 0) + (stats.today?.spins_used || 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.link}
                className={`block ${action.disabled ? 'pointer-events-none opacity-50' : ''}`}
              >
                <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-200 hover:scale-105">
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <span className="text-sm font-medium">Start earning</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Daily Progress */}
      {limits && (
        <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/20">
          <h3 className="font-semibold text-gray-900 mb-4">Today's Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Ads Watched</span>
                <span className="font-medium">{limits.ads.watched_today}/{limits.ads.daily_limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(limits.ads.watched_today / limits.ads.daily_limit) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Spins Used</span>
                <span className="font-medium">{limits.spins.used_today}/{limits.spins.daily_limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(limits.spins.used_today / limits.spins.daily_limit) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Dashboard

