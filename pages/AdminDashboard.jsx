import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  Shield,
  Users,
  DollarSign,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  Eye,
  Edit,
  LogOut,
  Settings,
  Gift,
  Plus,
  Trash2,
  Save,
  Menu,
  Smartphone
} from 'lucide-react'

const AdminDashboard = () => {
  const { 
    getAdminStats, 
    getAllWithdrawals, 
    updateWithdrawalStatus,
    apiCall
  } = useAuth()
  
  const [stats, setStats] = useState(null)
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [statusUpdate, setStatusUpdate] = useState({ status: '', admin_notes: '' })
  const [message, setMessage] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Configuration states
  const [settings, setSettings] = useState({
    daily_ad_limit: { value: '10', description: 'Daily Ad Limit' },
    ad_reward_amount: { value: '0.50', description: 'Ad Reward Amount (৳)' },
    daily_spin_limit: { value: '5', description: 'Daily Spin Limit' },
    spin_min_reward: { value: '0.10', description: 'Minimum Spin Reward (৳)' },
    spin_max_reward: { value: '2.00', description: 'Maximum Spin Reward (৳)' },
    min_withdrawal_amount: { value: '100.00', description: 'Minimum Withdrawal Amount (৳)' },
    withdrawal_fee: { value: '0.00', description: 'Withdrawal Fee (৳)' }
  })
  const [cpaOffers, setCpaOffers] = useState([])
  const [newOffer, setNewOffer] = useState({ title: '', description: '', link: '', reward_amount: '' })
  const [editingOffer, setEditingOffer] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, withdrawalsResponse] = await Promise.all([
          getAdminStats(),
          getAllWithdrawals(1, 50, filter)
        ])
        
        if (statsResponse.success) {
          setStats(statsResponse.stats)
        }
        
        if (withdrawalsResponse.success) {
          setWithdrawals(withdrawalsResponse.withdrawals)
        }

        // Fetch settings and CPA offers
        await fetchSettings()
        await fetchCpaOffers()
      } catch (error) {
        console.error('Failed to fetch admin data:', error)
        showMessage('Failed to load admin data', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [getAdminStats, getAllWithdrawals, filter])

  const fetchSettings = async () => {
    try {
      const response = await apiCall('/admin/settings')
      if (response.success && response.settings) {
        // Merge fetched settings with default values
        const defaultSettings = {
          daily_ad_limit: { value: '10', description: 'Daily Ad Limit' },
          ad_reward_amount: { value: '0.50', description: 'Ad Reward Amount (৳)' },
          daily_spin_limit: { value: '5', description: 'Daily Spin Limit' },
          spin_min_reward: { value: '0.10', description: 'Minimum Spin Reward (৳)' },
          spin_max_reward: { value: '2.00', description: 'Maximum Spin Reward (৳)' },
          min_withdrawal_amount: { value: '100.00', description: 'Minimum Withdrawal Amount (৳)' },
          withdrawal_fee: { value: '0.00', description: 'Withdrawal Fee (৳)' }
        }
        
        const mergedSettings = { ...defaultSettings }
        Object.keys(response.settings).forEach(key => {
          if (mergedSettings[key]) {
            mergedSettings[key].value = response.settings[key].toString()
          }
        })
        
        setSettings(mergedSettings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      // Keep default settings if fetch fails
    }
  }

  const fetchCpaOffers = async () => {
    try {
      const response = await apiCall('/admin/cpa-offers')
      if (response.success) {
        setCpaOffers(response.offers)
      }
    } catch (error) {
      console.error('Failed to fetch CPA offers:', error)
    }
  }

  const updateSettings = async () => {
    try {
      const settingsData = {}
      Object.keys(settings).forEach(key => {
        settingsData[key] = settings[key].value
      })

      const response = await apiCall('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings: settingsData })
      })

      if (response.success) {
        showMessage('Settings updated successfully', 'success')
      }
    } catch (error) {
      showMessage('Failed to update settings', 'error')
    }
  }

  const createCpaOffer = async () => {
    try {
      const response = await apiCall('/admin/cpa-offers', {
        method: 'POST',
        body: JSON.stringify(newOffer)
      })

      if (response.success) {
        showMessage('CPA offer created successfully', 'success')
        setNewOffer({ title: '', description: '', link: '', reward_amount: '' })
        await fetchCpaOffers()
      }
    } catch (error) {
      showMessage('Failed to create CPA offer', 'error')
    }
  }

  const updateCpaOffer = async (offerId, offerData) => {
    try {
      const response = await apiCall(`/admin/cpa-offers/${offerId}`, {
        method: 'PUT',
        body: JSON.stringify(offerData)
      })

      if (response.success) {
        showMessage('CPA offer updated successfully', 'success')
        setEditingOffer(null)
        await fetchCpaOffers()
      }
    } catch (error) {
      showMessage('Failed to update CPA offer', 'error')
    }
  }

  const deleteCpaOffer = async (offerId) => {
    if (!confirm('Are you sure you want to delete this CPA offer?')) return

    try {
      const response = await apiCall(`/admin/cpa-offers/${offerId}`, {
        method: 'DELETE'
      })

      if (response.success) {
        showMessage('CPA offer deleted successfully', 'success')
        await fetchCpaOffers()
      }
    } catch (error) {
      showMessage('Failed to delete CPA offer', 'error')
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleStatusUpdate = async () => {
    if (!selectedWithdrawal || !statusUpdate.status) {
      showMessage('Please select a status', 'error')
      return
    }

    try {
      const response = await updateWithdrawalStatus(selectedWithdrawal.id, statusUpdate)
      
      if (response.success) {
        showMessage(response.message, 'success')
        setSelectedWithdrawal(null)
        setStatusUpdate({ status: '', admin_notes: '' })
        
        // Refresh data
        const withdrawalsResponse = await getAllWithdrawals(1, 50, filter)
        if (withdrawalsResponse.success) {
          setWithdrawals(withdrawalsResponse.withdrawals)
        }
        
        const statsResponse = await getAdminStats()
        if (statsResponse.success) {
          setStats(statsResponse.stats)
        }
      }
    } catch (error) {
      showMessage(error.message || 'Failed to update withdrawal', 'error')
    }
  }

  const handleLogout = async () => {
    try {
      await apiCall('/admin/logout', { method: 'POST' })
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Logout failed:', error)
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Card className="p-4 lg:p-6 bg-white/10 backdrop-blur-md border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs lg:text-sm">Total Users</p>
                      <p className="text-lg lg:text-2xl font-bold text-white">{stats.users.total}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 lg:p-6 bg-white/10 backdrop-blur-md border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs lg:text-sm">Total Earnings</p>
                      <p className="text-lg lg:text-2xl font-bold text-white">৳{stats.earnings.total.toFixed(2)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 lg:p-6 bg-white/10 backdrop-blur-md border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs lg:text-sm">Total Withdrawn</p>
                      <p className="text-lg lg:text-2xl font-bold text-white">৳{stats.withdrawals.total_withdrawn.toFixed(2)}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 lg:p-6 bg-white/10 backdrop-blur-md border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs lg:text-sm">Pending Requests</p>
                      <p className="text-lg lg:text-2xl font-bold text-white">{stats.withdrawals.pending_requests}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Withdrawal Management */}
            <Card className="p-4 lg:p-6 bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
                <h2 className="text-lg lg:text-xl font-semibold text-white">Withdrawal Requests</h2>
                
                <div className="flex flex-wrap gap-2">
                  {['pending', 'approved', 'completed', 'rejected'].map((status) => (
                    <Button
                      key={status}
                      onClick={() => setFilter(status)}
                      variant={filter === status ? 'default' : 'outline'}
                      size="sm"
                      className={filter === status 
                        ? 'bg-purple-500 hover:bg-purple-600' 
                        : 'border-white/20 text-white hover:bg-white/10'
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {withdrawals.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">No {filter} withdrawal requests</p>
                  </div>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <Card key={withdrawal.id} className="p-4 bg-white/5 border-white/10">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(withdrawal.status)}`}>
                            {getStatusIcon(withdrawal.status)}
                            <span className="capitalize">{withdrawal.status}</span>
                          </div>
                          
                          <div>
                            <p className="font-semibold text-white">৳{withdrawal.amount}</p>
                            <p className="text-sm text-gray-300">
                              User: {withdrawal.user?.username || withdrawal.user?.first_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-400">
                              Method: {withdrawal.withdrawal_method?.toUpperCase() || 'TON'}
                            </p>
                            {withdrawal.ton_address && (
                              <p className="text-xs text-gray-400">
                                TON: {withdrawal.ton_address.slice(0, 10)}...{withdrawal.ton_address.slice(-6)}
                              </p>
                            )}
                            {withdrawal.bkash_number && (
                              <p className="text-xs text-gray-400">
                                Bkash: {withdrawal.bkash_number}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              {new Date(withdrawal.requested_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal)
                              setStatusUpdate({ status: withdrawal.status, admin_notes: withdrawal.admin_notes || '' })
                            }}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {withdrawal.admin_notes && (
                        <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-300">
                          <strong>Admin Note:</strong> {withdrawal.admin_notes}
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <Card className="p-4 lg:p-6 bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg lg:text-xl font-semibold text-white">App Configuration</h2>
                <Button
                  onClick={updateSettings}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(settings).map(([key, config]) => (
                  <div key={key}>
                    <Label className="text-white font-medium">{config.description}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={config.value}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        [key]: { ...config, value: e.target.value }
                      }))}
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )

      case 'cpa':
        return (
          <div className="space-y-6">
            {/* Add New CPA Offer */}
            <Card className="p-4 lg:p-6 bg-white/10 backdrop-blur-md border-white/20">
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-6">Add New CPA Offer</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-medium">Title</Label>
                  <Input
                    value={newOffer.title}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                    placeholder="Offer title"
                  />
                </div>
                
                <div>
                  <Label className="text-white font-medium">Reward Amount (৳)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newOffer.reward_amount}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, reward_amount: e.target.value }))}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <Label className="text-white font-medium">Link</Label>
                  <Input
                    value={newOffer.link}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, link: e.target.value }))}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <Label className="text-white font-medium">Description</Label>
                  <Textarea
                    value={newOffer.description}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                    placeholder="Offer description"
                    rows={3}
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <Button
                    onClick={createCpaOffer}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add CPA Offer
                  </Button>
                </div>
              </div>
            </Card>

            {/* Existing CPA Offers */}
            <Card className="p-4 lg:p-6 bg-white/10 backdrop-blur-md border-white/20">
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-6">Existing CPA Offers</h2>
              
              <div className="space-y-4">
                {cpaOffers.length === 0 ? (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">No CPA offers created yet</p>
                  </div>
                ) : (
                  cpaOffers.map((offer) => (
                    <Card key={offer.id} className="p-4 bg-white/5 border-white/10">
                      {editingOffer?.id === offer.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Input
                              value={editingOffer.title}
                              onChange={(e) => setEditingOffer(prev => ({ ...prev, title: e.target.value }))}
                              className="bg-white/10 border-white/20 text-white"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              value={editingOffer.reward_amount}
                              onChange={(e) => setEditingOffer(prev => ({ ...prev, reward_amount: e.target.value }))}
                              className="bg-white/10 border-white/20 text-white"
                            />
                            <Input
                              value={editingOffer.link}
                              onChange={(e) => setEditingOffer(prev => ({ ...prev, link: e.target.value }))}
                              className="bg-white/10 border-white/20 text-white lg:col-span-2"
                            />
                            <Textarea
                              value={editingOffer.description}
                              onChange={(e) => setEditingOffer(prev => ({ ...prev, description: e.target.value }))}
                              className="bg-white/10 border-white/20 text-white lg:col-span-2"
                              rows={2}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => updateCpaOffer(offer.id, editingOffer)}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingOffer(null)}
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                          <div>
                            <h3 className="font-semibold text-white">{offer.title}</h3>
                            <p className="text-sm text-gray-300">Reward: ৳{offer.reward_amount}</p>
                            <p className="text-xs text-gray-400 break-all">{offer.link}</p>
                            {offer.description && (
                              <p className="text-xs text-gray-400 mt-1">{offer.description}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                offer.is_active 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {offer.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingOffer(offer)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteCpaOffer(offer.id)}
                              className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/10 backdrop-blur-md border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          </div>
          
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mt-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'cpa', label: 'CPA Offers', icon: Gift }
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setMobileMenuOpen(false)
                }}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                className={`w-full justify-start ${
                  activeTab === tab.id 
                    ? 'bg-purple-500 hover:bg-purple-600' 
                    : 'border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white/5 backdrop-blur-md border-r border-white/20 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-300">Management Dashboard</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                { id: 'settings', label: 'Settings', icon: Settings },
                { id: 'cpa', label: 'CPA Offers', icon: Gift }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  className={`w-full justify-start ${
                    activeTab === tab.id 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </nav>
            
            <div className="mt-8 pt-8 border-t border-white/20">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
              <p className="text-gray-300">
                {activeTab === 'dashboard' && 'Platform overview and statistics'}
                {activeTab === 'settings' && 'Configure application settings'}
                {activeTab === 'cpa' && 'Manage CPA offers and campaigns'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Smartphone className="w-4 h-4" />
              <span>Mobile Responsive</span>
            </div>
          </div>

          {/* Message */}
          {message && (
            <Card className={`p-4 mb-6 ${
              message.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-100' 
                : 'bg-red-500/20 border-red-500/30 text-red-100'
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

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>

      {/* Update Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white/10 backdrop-blur-md border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Update Withdrawal Request
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-white font-medium">Status</Label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full mt-1 p-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  <option value="pending" className="bg-gray-800 text-white">Pending</option>
                  <option value="approved" className="bg-gray-800 text-white">Approved</option>
                  <option value="completed" className="bg-gray-800 text-white">Completed</option>
                  <option value="rejected" className="bg-gray-800 text-white">Rejected</option>
                </select>
              </div>
              
              <div>
                <Label className="text-white font-medium">Admin Notes</Label>
                <Textarea
                  value={statusUpdate.admin_notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, admin_notes: e.target.value }))}
                  placeholder="Add notes for the user..."
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleStatusUpdate}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  Update
                </Button>
                <Button
                  onClick={() => {
                    setSelectedWithdrawal(null)
                    setStatusUpdate({ status: '', admin_notes: '' })
                  }}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

