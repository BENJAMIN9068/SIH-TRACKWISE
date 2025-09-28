// ===== TrackWise - Modern Transportation System JavaScript ===== //

class ModernApp {
  constructor() {
    this.theme = localStorage.getItem('trackwise-theme') || 'light';
    this.chatbot = new AIBusChatbot();
    this.notifications = new NotificationSystem();
    this.animations = new AnimationManager();
    this.init();
  }

  init() {
    this.applyTheme(); // Apply theme first
    this.setupThemeToggle();
    this.setupFallingBuses();
    this.setupAnimations();
    this.setupPWA();
    this.setupRealTimeUpdates();
    console.log('🚀 TrackWise System Initialized!');
  }

  // Theme Management
  setupThemeToggle() {
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.addEventListener('click', () => this.toggleTheme());
    document.body.appendChild(themeToggle);
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    localStorage.setItem('trackwise-theme', this.theme);
    
    // Smooth transition effect
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  applyTheme() {
    // Apply to body for CSS variables to work
    document.body.setAttribute('data-theme', this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
    
    // Update all theme icons on the page
    const themeIcons = document.querySelectorAll('.theme-toggle i');
    themeIcons.forEach(icon => {
      icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    });
    
    // Update meta theme color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = this.theme === 'light' ? '#667eea' : '#1a202c';
    }
  }

  // Falling Bus Icons Animation
  setupFallingBuses() {
    const container = document.createElement('div');
    container.className = 'falling-buses';
    
    // Create 10 falling bus icons
    for (let i = 0; i < 10; i++) {
      const busIcon = document.createElement('i');
      busIcon.className = 'fas fa-bus bus-icon';
      container.appendChild(busIcon);
    }
    
    document.body.appendChild(container);
  }

  // Animation Management
  setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-in');
        }
      });
    }, observerOptions);
    
    // Observe all cards and containers
    document.querySelectorAll('.modern-card, .stats-card, .glass-container').forEach(el => {
      observer.observe(el);
    });
  }

  // Progressive Web App Setup
  setupPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      const installButton = document.createElement('button');
      installButton.className = 'fab';
      installButton.innerHTML = '<i class="fas fa-download"></i>';
      installButton.title = 'Install App';
      installButton.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choiceResult => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
          installButton.remove();
        });
      });
      
      document.body.appendChild(installButton);
    });
  }

  // Real-time Updates
  setupRealTimeUpdates() {
    // Socket.IO connection for real-time updates
    if (typeof io !== 'undefined') {
      const socket = io();
      
      socket.on('busLocationUpdate', (data) => {
        this.updateBusLocation(data);
        this.notifications.show('Bus location updated', 'success');
      });
      
      socket.on('newJourney', (data) => {
        this.notifications.show(`New journey started: ${data.route}`, 'success');
      });
    }
  }

  updateBusLocation(data) {
    // Update map markers or UI elements
    console.log('Updating bus location:', data);
  }
}

// AI Chatbot System
class AIBusChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.setupChatbot();
  }

  setupChatbot() {
    // Create chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    
    // Toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'chatbot-toggle pulse';
    toggleButton.innerHTML = '<i class="fas fa-robot"></i>';
    toggleButton.addEventListener('click', () => this.toggle());
    
    // Chatbot widget
    const widget = document.createElement('div');
    widget.className = 'chatbot-widget';
    widget.innerHTML = `
      <div class="chatbot-header">
        <i class="fas fa-robot"></i> Bus Tracking Assistant
      </div>
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="bot-message">
          Hello! I'm your AI bus tracking assistant. How can I help you today?
        </div>
      </div>
      <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" placeholder="Ask me anything..." 
               onkeypress="if(event.key==='Enter') busChatbot.sendMessage(this.value, this)">
        <button class="btn-modern" onclick="busChatbot.sendMessage(document.querySelector('.chatbot-input').value, document.querySelector('.chatbot-input'))">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    `;
    
    chatbotContainer.appendChild(toggleButton);
    chatbotContainer.appendChild(widget);
    document.body.appendChild(chatbotContainer);
    
    // Make chatbot globally accessible
    window.busChatbot = this;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const widget = document.querySelector('.chatbot-widget');
    widget.classList.toggle('active', this.isOpen);
  }

  async sendMessage(message, inputElement) {
    if (!message.trim()) return;
    
    // Add user message
    this.addMessage(message, 'user');
    inputElement.value = '';
    
    // Show typing indicator
    this.showTyping();
    
    try {
      // Simulate AI response (replace with actual API call)
      const response = await this.getAIResponse(message);
      this.hideTyping();
      this.addMessage(response, 'bot');
    } catch (error) {
      this.hideTyping();
      this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
  }

  addMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${sender}-message`;
    messageDiv.innerHTML = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = 'AI is typing...';
    document.getElementById('chatbot-messages').appendChild(typingDiv);
  }

  hideTyping() {
    const typing = document.querySelector('.typing-indicator');
    if (typing) typing.remove();
  }

  async getAIResponse(message) {
    try {
      // Call the actual AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          context: this.messages.slice(-5) // Send last 5 messages for context
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store message in context for future requests
      this.messages.push(
        { role: 'user', content: message },
        { role: 'assistant', content: data.response }
      );
      
      return data.response || 'Sorry, I couldn\'t process your request right now.';
      
    } catch (error) {
      console.error('AI API Error:', error);
      
      // Fallback to enhanced static responses for better demo experience
      return this.getFallbackResponse(message);
    }
  }
  
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('fastest route') || lowerMessage.includes('airport')) {
      return `🤖 I found 3 routes to the airport! Route A via Express Lane is fastest (28 min). Bus DL-1PC-1234 departing in 5 minutes from Gate B. Would you like me to book this for you?`;
    }
    
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
      return `✅ Booked! Seat 15A reserved on Bus DL-1PC-1234. Sending QR code to your phone. Your journey starts in 5 minutes at Gate B.`;
    }
    
    if (lowerMessage.includes('track') && (lowerMessage.includes('bus') || lowerMessage.includes('my'))) {
      return `🚌 Your bus DL-1PC-1234 is currently 2 stops away, arriving in 3 minutes at Gate B. Current location: Junction Road & Main Street.`;
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `👋 Hello! I'm your TrackWise AI assistant. I can help you find the fastest routes, book tickets, track buses in real-time, and answer questions about our smart transportation system. What can I help you with today?`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('features')) {
      return `🌟 I can help you with:\n• Finding fastest routes between locations\n• Real-time bus tracking and ETAs\n• Booking tickets and seat reservations\n• Live traffic and delay updates\n• Route optimization and alternatives\n\nJust tell me where you want to go!`;
    }
    
    // Default enhanced response
    return `🤖 Thanks for your question! I'm here to help with all your transportation needs. I can assist with route planning, real-time tracking, bookings, and travel guidance. What would you like to know about TrackWise?`;
  }
}

// Notification System
class NotificationSystem {
  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <strong>${type.toUpperCase()}</strong>
        <p>${message}</p>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Animation Manager
class AnimationManager {
  constructor() {
    this.setupScrollAnimations();
    this.setupHoverEffects();
  }

  setupScrollAnimations() {
    // Add smooth scroll to all internal links
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  }

  setupHoverEffects() {
    // Add magnetic effect to buttons
    document.querySelectorAll('.btn-modern').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // Utility animation functions
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      
      element.style.opacity = Math.min(progress / duration, 1);
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  slideUp(element, duration = 300) {
    element.style.height = element.offsetHeight + 'px';
    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease-out`;
    
    requestAnimationFrame(() => {
      element.style.height = '0';
    });
    
    setTimeout(() => {
      element.style.display = 'none';
      element.style.height = '';
      element.style.overflow = '';
      element.style.transition = '';
    }, duration);
  }
}

// Enhanced Map Functionality
class ModernMapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.busMarkers = [];
    this.init();
  }

  init() {
    if (typeof L === 'undefined') {
      console.warn('Leaflet not loaded');
      return;
    }

    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Initialize map with modern styling
    this.map = L.map(this.containerId, {
      zoomControl: false,
      attributionControl: false
    }).setView([20.5937, 78.9629], 5);

    // Add modern tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(this.map);

    // Add custom zoom control
    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);

    // Custom bus marker style
    this.busIcon = L.divIcon({
      html: '<i class="fas fa-bus glow"></i>',
      iconSize: [30, 30],
      className: 'bus-marker-icon'
    });
  }

  addBusMarker(lat, lng, busInfo) {
    if (!this.map) return;

    const marker = L.marker([lat, lng], { icon: this.busIcon })
      .addTo(this.map);

    marker.bindPopup(`
      <div class="modern-popup">
        <h4>${busInfo.busNumber}</h4>
        <p><strong>Route:</strong> ${busInfo.route}</p>
        <p><strong>Status:</strong> <span class="status-${busInfo.status}">${busInfo.status}</span></p>
        <button class="btn-modern btn-sm" onclick="trackBus('${busInfo.id}')">Track Bus</button>
      </div>
    `);

    this.busMarkers.push(marker);
    return marker;
  }

  updateBusLocation(busId, lat, lng) {
    // Update existing marker or create new one
    const marker = this.busMarkers.find(m => m.busId === busId);
    if (marker) {
      marker.setLatLng([lat, lng]);
    }
  }
}

// GPS Tracking Enhancement
class GPSTracker {
  constructor() {
    this.watchId = null;
    this.lastPosition = null;
    this.isTracking = false;
  }

  startTracking(callback) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    this.isTracking = true;
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.lastPosition = position;
        callback(position);
      },
      (error) => {
        console.error('GPS Error:', error);
        this.stopTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }

  stopTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    });
  }
}

// Initialize the modern app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.modernApp = new ModernApp();
  
  // Initialize other components
  window.gpsTracker = new GPSTracker();
  
  // Add loading screen fade out
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.style.opacity = '0';
      setTimeout(() => loadingScreen.remove(), 500);
    }, 1000);
  }
});

// Utility Functions
function showNotification(message, type = 'info') {
  if (window.modernApp && window.modernApp.notifications) {
    window.modernApp.notifications.show(message, type);
  }
}

function toggleFullscreen(element) {
  if (!document.fullscreenElement) {
    element.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!', 'success');
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ModernApp,
    AIBusChatbot,
    NotificationSystem,
    AnimationManager,
    ModernMapManager,
    GPSTracker
  };
}
