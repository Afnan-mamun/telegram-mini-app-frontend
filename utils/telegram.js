// Telegram WebApp SDK Integration
class TelegramWebApp {
  constructor() {
    this.webApp = window.Telegram?.WebApp
    this.isAvailable = !!this.webApp
    this.user = null
    this.initData = null
    
    if (this.isAvailable) {
      this.init()
    }
  }

  init() {
    // Initialize Telegram WebApp
    this.webApp.ready()
    
    // Set up theme
    this.webApp.setHeaderColor('#6366f1')
    this.webApp.setBackgroundColor('#f8fafc')
    
    // Enable closing confirmation
    this.webApp.enableClosingConfirmation()
    
    // Get user data
    this.user = this.webApp.initDataUnsafe?.user
    this.initData = this.webApp.initData
    
    // Set up main button
    this.setupMainButton()
    
    // Set up back button
    this.setupBackButton()
  }

  setupMainButton() {
    if (!this.webApp.MainButton) return
    
    this.webApp.MainButton.setText('Continue')
    this.webApp.MainButton.color = '#6366f1'
    this.webApp.MainButton.textColor = '#ffffff'
  }

  setupBackButton() {
    if (!this.webApp.BackButton) return
    
    // Hide back button initially
    this.webApp.BackButton.hide()
  }

  // Get user data for authentication
  getUserData() {
    if (!this.isAvailable) {
      // Return mock data for development
      return {
        id: 123456789,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        photo_url: 'https://via.placeholder.com/150',
        language_code: 'en'
      }
    }

    return this.user
  }

  // Get init data for backend verification
  getInitData() {
    if (!this.isAvailable) {
      // Return mock init data for development
      return 'mock_init_data_for_development'
    }

    return this.initData
  }

  // Show main button
  showMainButton(text = 'Continue', onClick = null) {
    if (!this.webApp.MainButton) return

    this.webApp.MainButton.setText(text)
    this.webApp.MainButton.show()
    
    if (onClick) {
      this.webApp.MainButton.onClick(onClick)
    }
  }

  // Hide main button
  hideMainButton() {
    if (!this.webApp.MainButton) return
    this.webApp.MainButton.hide()
  }

  // Show back button
  showBackButton(onClick = null) {
    if (!this.webApp.BackButton) return
    
    this.webApp.BackButton.show()
    
    if (onClick) {
      this.webApp.BackButton.onClick(onClick)
    }
  }

  // Hide back button
  hideBackButton() {
    if (!this.webApp.BackButton) return
    this.webApp.BackButton.hide()
  }

  // Show alert
  showAlert(message) {
    if (!this.webApp.showAlert) {
      alert(message)
      return
    }
    
    this.webApp.showAlert(message)
  }

  // Show confirm
  showConfirm(message, callback) {
    if (!this.webApp.showConfirm) {
      const result = confirm(message)
      callback(result)
      return
    }
    
    this.webApp.showConfirm(message, callback)
  }

  // Show popup
  showPopup(params) {
    if (!this.webApp.showPopup) {
      alert(params.message)
      return
    }
    
    this.webApp.showPopup(params)
  }

  // Haptic feedback
  impactOccurred(style = 'medium') {
    if (!this.webApp.HapticFeedback) return
    
    this.webApp.HapticFeedback.impactOccurred(style)
  }

  // Notification feedback
  notificationOccurred(type = 'success') {
    if (!this.webApp.HapticFeedback) return
    
    this.webApp.HapticFeedback.notificationOccurred(type)
  }

  // Selection changed feedback
  selectionChanged() {
    if (!this.webApp.HapticFeedback) return
    
    this.webApp.HapticFeedback.selectionChanged()
  }

  // Open link
  openLink(url, options = {}) {
    if (!this.webApp.openLink) {
      window.open(url, '_blank')
      return
    }
    
    this.webApp.openLink(url, options)
  }

  // Open telegram link
  openTelegramLink(url) {
    if (!this.webApp.openTelegramLink) {
      window.open(url, '_blank')
      return
    }
    
    this.webApp.openTelegramLink(url)
  }

  // Close app
  close() {
    if (!this.webApp.close) {
      window.close()
      return
    }
    
    this.webApp.close()
  }

  // Expand app
  expand() {
    if (!this.webApp.expand) return
    
    this.webApp.expand()
  }

  // Get theme params
  getThemeParams() {
    if (!this.webApp.themeParams) {
      return {
        bg_color: '#ffffff',
        text_color: '#000000',
        hint_color: '#999999',
        link_color: '#6366f1',
        button_color: '#6366f1',
        button_text_color: '#ffffff'
      }
    }
    
    return this.webApp.themeParams
  }

  // Check if running in Telegram
  isInTelegram() {
    return this.isAvailable
  }

  // Get viewport height
  getViewportHeight() {
    if (!this.webApp.viewportHeight) {
      return window.innerHeight
    }
    
    return this.webApp.viewportHeight
  }

  // Get viewport stable height
  getViewportStableHeight() {
    if (!this.webApp.viewportStableHeight) {
      return window.innerHeight
    }
    
    return this.webApp.viewportStableHeight
  }

  // Set header color
  setHeaderColor(color) {
    if (!this.webApp.setHeaderColor) return
    
    this.webApp.setHeaderColor(color)
  }

  // Set background color
  setBackgroundColor(color) {
    if (!this.webApp.setBackgroundColor) return
    
    this.webApp.setBackgroundColor(color)
  }

  // Enable closing confirmation
  enableClosingConfirmation() {
    if (!this.webApp.enableClosingConfirmation) return
    
    this.webApp.enableClosingConfirmation()
  }

  // Disable closing confirmation
  disableClosingConfirmation() {
    if (!this.webApp.disableClosingConfirmation) return
    
    this.webApp.disableClosingConfirmation()
  }
}

// Create singleton instance
const telegramWebApp = new TelegramWebApp()

export default telegramWebApp

