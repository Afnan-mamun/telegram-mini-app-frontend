import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  History,
  TrendingUp,
  CreditCard,
  Eye,
  RotateCcw,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  X
} from 'lucide-react'

const HistoryPage = () => {
  const { 
    user, 
    getEarningsHistory, 
    getWithdrawalHistory,
    getEarningsStats
  } = useAuth()
  
  const [activeTab, setActiveTab] = useState('earnings')
  const [earnings, setEarnings] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [earningsResponse, withdrawalsResponse, statsResponse] = await Promise.all([
          getEarningsHistory(1, 20),
          getWithdrawalHistory(1, 20),
          getEarningsStats()
        ])
        
        if (earningsResponse.success) {
          setEarnings(earningsResponse.earnings)
          setHasMore(earningsResponse.pagination.has_next)
        }
        
        if (withdrawalsResponse.success) {
          setWithdrawals(withdrawalsResponse.withdrawals)
        }
        
        if (statsResponse.success) {
          setStats(statsResponse.stats)
        }
      } catch (error) {
        console.error('Failed to fetch history data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, getEarningsHistory, getWithdrawalHistory, getEarningsStats])

  const loadMoreEarnings = async () => {
    try {
      const nextPage = page + 1
      const response = await getEarningsHistory(nextPage, 20)
      
      if (response.success) {
        setEarnings(prev => [...prev, ...response.earnings])
        setPage(nextPage)
        setHasMore(response.pagination.has_next)
      }
    } catch (error) {
      console.error('Failed to load more earnings:', error)
    }
  }

  const getEarningIcon = (type) => {
    switch (type) {
      case 'ad': return <Eye className="w-4 h-4" />
      case 'spin': return <RotateCcw className="w-4 h-4" />
      case 'cpa': return <Briefcase className="w-4 h-4" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  const getEarningColor = (type) => {
    switch (type) {
      case 'ad': return 'text-blue-600 bg-blue-100'
      case 'spin': return 'text-purple-600 bg-purple-100'
      case 'cpa': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <X className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">History 📊</h1>
        <p className="text-gray-600">Track your earnings and withdrawals</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-lg font-semibold text-gray-900">
                  ৳{stats.total_earned?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-lg font-semibold text-gray-900">
                  ৳{stats.current_balance?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Earning Breakdown */}
      {stats?.by_type && (
        <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/20">
          <h3 className="font-semibold text-gray-900 mb-3">Earnings Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(stats.by_type).map(([type, data]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${getEarningColor(type)}`}>
                    {getEarningIcon(type)}
                  </div>
                  <span className="text-sm font-medium capitalize">{type}</span>
                  <span className="text-xs text-gray-500">({data.count} times)</span>
                </div>
                <span className="font-semibold text-gray-900">৳{data.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex bg-white/60 backdrop-blur-sm rounded-lg p-1">
        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'earnings'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Earnings
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'withdrawals'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Withdrawals
        </button>
      </div>

      {/* Content */}
      {activeTab === 'earnings' ? (
        <div className="space-y-4">
          {earnings.length === 0 ? (
            <Card className="p-8 text-center bg-white/60 backdrop-blur-sm border-white/20">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Earnings Yet</h3>
              <p className="text-gray-600">Start earning by watching ads or spinning the wheel!</p>
            </Card>
          ) : (
            <>
              {earnings.map((earning) => (
                <Card key={earning.id} className="p-4 bg-white/60 backdrop-blur-sm border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getEarningColor(earning.earning_type)}`}>
                        {getEarningIcon(earning.earning_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {earning.earning_type} Earning
                        </h3>
                        <p className="text-sm text-gray-600">{earning.description}</p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(earning.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        +৳{earning.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {hasMore && (
                <div className="text-center">
                  <Button
                    onClick={loadMoreEarnings}
                    variant="outline"
                    className="bg-white/60 backdrop-blur-sm border-white/20"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.length === 0 ? (
            <Card className="p-8 text-center bg-white/60 backdrop-blur-sm border-white/20">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Withdrawals Yet</h3>
              <p className="text-gray-600">Make your first withdrawal when you reach ৳100!</p>
            </Card>
          ) : (
            withdrawals.map((withdrawal) => (
              <Card key={withdrawal.id} className="p-4 bg-white/60 backdrop-blur-sm border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      <span className="capitalize">{withdrawal.status}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Withdrawal Request</h3>
                      <p className="text-sm text-gray-600">
                        TON: {withdrawal.ton_address.slice(0, 10)}...{withdrawal.ton_address.slice(-6)}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(withdrawal.requested_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">
                      -৳{withdrawal.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {withdrawal.admin_notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    <strong>Admin Note:</strong> {withdrawal.admin_notes}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryPage

