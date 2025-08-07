import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  DollarSign,
  Smartphone
} from 'lucide-react'

const WithdrawPage = () => {
  const { 
    user, 
    requestWithdrawal, 
    getWithdrawalHistory, 
    cancelWithdrawal 
  } = useAuth()
  
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('ton')
  const [tonAddress, setTonAddress] = useState('')
  const [bkashNumber, setBkashNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [withdrawals, setWithdrawals] = useState([])
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await getWithdrawalHistory(1, 10)
        if (response.success) {
          setWithdrawals(response.withdrawals)
        }
      } catch (error) {
        console.error('Failed to fetch withdrawals:', error)
      }
    }

    if (user) {
      fetchWithdrawals()
    }
  }, [user, getWithdrawalHistory])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const withdrawAmount = parseFloat(amount)
    
    if (!withdrawAmount || withdrawAmount < user?.min_withdrawal_amount?.value) {
      showMessage('Minimum withdrawal amount is ৳100', 'error')
      return
    }
    
    if (withdrawAmount > user.balance) {
      showMessage('Insufficient balance', 'error')
      return
    }
    
    if (paymentMethod === 'ton' && !tonAddress.trim()) {
      showMessage('TON address is required', 'error')
      return
    }
    
    if (paymentMethod === 'bkash' && !bkashNumber.trim()) {
      showMessage('Bkash number is required', 'error')
      return
    }

    try {
      setLoading(true)
      const withdrawalData = {
        amount: withdrawAmount,
        payment_method: paymentMethod
      }
      
      if (paymentMethod === 'ton') {
        withdrawalData.ton_address = tonAddress.trim()
      } else if (paymentMethod === 'bkash') {
        withdrawalData.bkash_number = bkashNumber.trim()
      }
      
      const response = await requestWithdrawal(withdrawalData)
      
      if (response.success) {
        showMessage(response.message, 'success')
        setAmount('')
        setTonAddress('')
        setBkashNumber('')
        
        // Refresh withdrawal history
        const historyResponse = await getWithdrawalHistory(1, 10)
        if (historyResponse.success) {
          setWithdrawals(historyResponse.withdrawals)
        }
      }
    } catch (error) {
      showMessage(error.message || 'Failed to request withdrawal', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (withdrawalId) => {
    try {
      const response = await cancelWithdrawal(withdrawalId)
      if (response.success) {
        showMessage(response.message, 'success')
        
        // Refresh withdrawal history
        const historyResponse = await getWithdrawalHistory(1, 10)
        if (historyResponse.success) {
          setWithdrawals(historyResponse.withdrawals)
        }
      }
    } catch (error) {
      showMessage(error.message || 'Failed to cancel withdrawal', 'error')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Withdraw Money 💳</h1>
        <p className="text-gray-600">Cash out your earnings</p>
      </div>

      {/* Balance Card */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">৳{user?.balance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Minimum withdrawal</p>
            <p className="text-sm font-semibold text-gray-700">৳{user?.min_withdrawal_amount?.value || '100.00'}</p>
          </div>
        </div>
      </Card>

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

      {/* Withdrawal Form */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Request Withdrawal</h2>
          </div>

          <div className="space-y-4">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('ton')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'ton'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <span className="font-medium text-sm">TON Wallet</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Smartphone className="w-6 h-6 text-pink-600" />
                  <span className="font-medium text-sm">বিকাশ</span>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount (৳)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount (min ৳{user?.min_withdrawal_amount?.value || 100})"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                min="100"
                max={user?.balance || 0}
                step="0.01"
                required
              />
            </div>
          </div>

          {paymentMethod === 'ton' && (
            <div className="space-y-2">
              <Label htmlFor="tonAddress">TON Wallet Address</Label>
              <Input
                id="tonAddress"
                type="text"
                placeholder="Enter your TON wallet address"
                value={tonAddress}
                onChange={(e) => setTonAddress(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Make sure your TON address is correct. Withdrawals cannot be reversed.
              </p>
            </div>
          )}

          {paymentMethod === 'bkash' && (
            <div className="space-y-2">
              <Label htmlFor="bkashNumber">বিকাশ নম্বর</Label>
              <Input
                id="bkashNumber"
                type="text"
                placeholder="01XXXXXXXXX"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                আপনার বিকাশ নম্বর সঠিক কিনা নিশ্চিত করুন। উইথড্র বাতিল করা যাবে না।
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || (user?.balance || 0) < 100}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            size="lg"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              'Request Withdrawal'
            )}
          </Button>
        </form>
      </Card>

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Withdrawals</h2>
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="bg-white/60 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                      {getStatusIcon(withdrawal.status)}
                      <span className="capitalize">{withdrawal.status}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">৳{withdrawal.amount}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(withdrawal.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {withdrawal.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(withdrawal.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
                
                {withdrawal.admin_notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    <strong>Admin Note:</strong> {withdrawal.admin_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Withdrawal Information:</p>
            <ul className="space-y-1 text-xs">
              <li>• Minimum withdrawal amount is ৳{user?.min_withdrawal_amount?.value || 100}</li>
              <li>• Withdrawals are processed within 24-48 hours</li>
              <li>• Make sure your TON address is correct</li>
              <li>• You can cancel pending withdrawals</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default WithdrawPage

