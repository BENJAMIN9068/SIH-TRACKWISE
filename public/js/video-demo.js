// TrackWise Animated Video Demo Controller

class TrackWiseDemo {
    constructor() {
        this.currentScene = 0;
        this.scenes = [
            'login-scene',
            'dashboard-scene', 
            'map-scene',
            'ai-chat-scene',
            'analytics-scene',
            'updates-scene',
            'feedback-scene'
        ];
        this.autoPlayInterval = null;
        this.isPlaying = false;
        this.sceneDuration = 5000; // 5 seconds per scene for better showcase
        
        this.init();
    }
    
    init() {
        this.createDemoHTML();
        this.setupEventListeners();
        this.startDemo();
    }
    
    createDemoHTML() {
        const demoContainer = document.querySelector('.demo-screen');
        if (!demoContainer) return;
        
        demoContainer.innerHTML = `
            <!-- Scene 1: Login -->
            <div class="demo-scene active" id="login-scene">
                <div class="login-demo">
                    <div class="login-card">
                        <h3 class="login-title">🚌 TrackWise Login</h3>
                        <form class="login-form">
                            <div class="form-group">
                                <input type="email" placeholder="Enter your email" value="demo@trackwise.com">
                            </div>
                            <div class="form-group">
                                <input type="password" placeholder="Password" value="••••••••">
                            </div>
                            <button type="button" class="login-btn">Login to Dashboard</button>
                        </form>
                    </div>
                </div>
            </div>
            
            <!-- Scene 2: Dashboard -->
            <div class="demo-scene" id="dashboard-scene">
                <div class="dashboard-demo">
                    <div class="dashboard-nav">
                        <span>🚌 TrackWise Dashboard</span>
                        <span style="margin-left: auto;">Welcome, Demo User</span>
                    </div>
                    <div class="dashboard-content">
                        <div class="dashboard-card">
                            <span class="icon">🔍</span>
                            <h4>Search Buses</h4>
                            <p>Find buses between any locations</p>
                        </div>
                        <div class="dashboard-card">
                            <span class="icon">📍</span>
                            <h4>Live Tracking</h4>
                            <p>Real-time GPS bus locations</p>
                        </div>
                        <div class="dashboard-card">
                            <span class="icon">🗺️</span>
                            <h4>Route Planning</h4>
                            <p>Smart journey optimization</p>
                        </div>
                        <div class="dashboard-card">
                            <span class="icon">🤖</span>
                            <h4>AI Assistant</h4>
                            <p>Intelligent travel guidance</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Scene 3: Map Tracking -->
            <div class="demo-scene" id="map-scene">
                <div class="map-demo">
                    <div class="map-container">
                        <div class="map-overlay">
                            <h4>🚌 Bus DL-1PC-1234</h4>
                            <p><strong>Route:</strong> Central Station → Airport</p>
                            <p><strong>Status:</strong> <span style="color: #48bb78;">On Time</span></p>
                            <p><strong>ETA:</strong> 15 minutes</p>
                        </div>
                        <div class="bus-marker">🚌</div>
                        <div class="route-line"></div>
                    </div>
                </div>
            </div>
            
            <!-- Scene 4: AI Chat Assistant -->
            <div class="demo-scene" id="ai-chat-scene">
                <div class="ai-chat-demo">
                    <div class="chat-header">
                        <h3>🤖 AI Travel Assistant</h3>
                    </div>
                    <div class="chat-window">
                        <div class="chat-message user">"Find me the fastest route to the airport"</div>
                        <div class="chat-message bot">
                            <div class="typing-indicator">●●●</div>
                            🤖 I found 3 routes. Route A via Express Lane is fastest (28 min). Bus DL-1PC-1234 departing in 5 minutes.
                        </div>
                        <div class="chat-message user">"Book this route for me"</div>
                        <div class="chat-message bot">✅ Booked! Seat 15A reserved. Sending QR code to your phone.</div>
                        <div class="chat-message user">"Track my bus please"</div>
                        <div class="chat-message bot">🚌 Your bus is 2 stops away, arriving in 3 minutes at Gate B.</div>
                    </div>
                </div>
            </div>
            
            <!-- Scene 5: Analytics Dashboard -->
            <div class="demo-scene" id="analytics-scene">
                <div class="analytics-demo">
                    <h3 style="margin-bottom: 1rem;">📊 Real-time Analytics</h3>
                    <div class="analytics-grid">
                        <div class="analytics-card">
                            <div class="analytics-number">2,847</div>
                            <div class="analytics-label">Active Buses</div>
                            <div class="analytics-trend up">↗ +5.2%</div>
                        </div>
                        <div class="analytics-card">
                            <div class="analytics-number">45,290</div>
                            <div class="analytics-label">Daily Passengers</div>
                            <div class="analytics-trend up">↗ +12.8%</div>
                        </div>
                        <div class="analytics-card">
                            <div class="analytics-number">94.2%</div>
                            <div class="analytics-label">On-time Performance</div>
                            <div class="analytics-trend up">↗ +2.1%</div>
                        </div>
                        <div class="analytics-card">
                            <div class="analytics-number">4.8★</div>
                            <div class="analytics-label">Avg Rating</div>
                            <div class="analytics-trend up">↗ +0.3</div>
                        </div>
                    </div>
                    <div class="analytics-chart">
                        <div class="chart-bars">
                            <div class="bar" style="height: 60%;"></div>
                            <div class="bar" style="height: 80%;"></div>
                            <div class="bar" style="height: 45%;"></div>
                            <div class="bar" style="height: 95%;"></div>
                            <div class="bar" style="height: 70%;"></div>
                            <div class="bar" style="height: 85%;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Scene 6: Real-time Updates -->
            <div class="demo-scene" id="updates-scene">
                <div class="updates-demo">
                    <h3 style="margin-bottom: 1rem;">⚡ Live System Monitor</h3>
                    <div class="terminal-window">
                        <div class="terminal-line success">✓ GPS location updated: Bus DL-1PC-1234 [28.6139°N, 77.2090°E]</div>
                        <div class="terminal-line info">ℹ Passenger count: 28/50 seats (56% capacity)</div>
                        <div class="terminal-line warning">⚠ Traffic alert: Delay 5 minutes on Route 15</div>
                        <div class="terminal-line success">✓ Route optimized automatically - saved 8 minutes</div>
                        <div class="terminal-line info">ℹ ETA updated: 20 minutes → 17 minutes</div>
                        <div class="terminal-line success">✓ Push notifications sent to 156 passengers</div>
                        <div class="terminal-line info">ℹ Weather update: Light rain detected, adjusting speeds</div>
                        <div class="terminal-line success">✓ AI model prediction: 92% on-time arrival probability</div>
                    </div>
                </div>
            </div>
            
            <!-- Scene 7: Feedback System -->
            <div class="demo-scene" id="feedback-scene">
                <div class="feedback-demo">
                    <h3 style="margin-bottom: 1rem;">💬 Passenger Feedback</h3>
                    <div class="feedback-container">
                        <div class="feedback-item">
                            <div class="feedback-avatar">👤</div>
                            <div class="feedback-content">
                                <div class="feedback-rating">⭐⭐⭐⭐⭐</div>
                                <div class="feedback-text">"Excellent service! Bus arrived exactly on time."</div>
                                <div class="feedback-meta">Sarah M. - Route 15 - 2 min ago</div>
                            </div>
                        </div>
                        <div class="feedback-item">
                            <div class="feedback-avatar">👤</div>
                            <div class="feedback-content">
                                <div class="feedback-rating">⭐⭐⭐⭐⭐</div>
                                <div class="feedback-text">"AI assistant helped me find the perfect route!"</div>
                                <div class="feedback-meta">Alex R. - Route 8 - 5 min ago</div>
                            </div>
                        </div>
                        <div class="feedback-item">
                            <div class="feedback-avatar">👤</div>
                            <div class="feedback-content">
                                <div class="feedback-rating">⭐⭐⭐⭐⭐</div>
                                <div class="feedback-text">"Love the real-time tracking feature!"</div>
                                <div class="feedback-meta">Maria L. - Route 22 - 8 min ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Navigation dots click events
        const navDots = document.querySelectorAll('.nav-dot');
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToScene(index);
            });
        });
        
        // Play/pause on demo container click
        const demoContainer = document.querySelector('.demo-video-container');
        if (demoContainer) {
            demoContainer.addEventListener('click', (e) => {
                // Avoid toggling when clicking on controls inside the container
                const target = e.target;
                if (target.closest('.btn') || target.closest('input')) return;
                this.togglePlayPause();
            });
        }
        
        // Control buttons if present
        const playBtn = document.querySelector('[data-action="play"]');
        const pauseBtn = document.querySelector('[data-action="pause"]');
        const prevBtn = document.querySelector('[data-action="prev"]');
        const nextBtn = document.querySelector('[data-action="next"]');
        const fsBtn = document.querySelector('[data-action="fullscreen"]');
        const speed = document.getElementById('demo-speed');
        
        playBtn && playBtn.addEventListener('click', () => this.play());
        pauseBtn && pauseBtn.addEventListener('click', () => this.pause());
        prevBtn && prevBtn.addEventListener('click', () => this.previousScene());
        nextBtn && nextBtn.addEventListener('click', () => this.nextScene());
        if (speed) {
            speed.addEventListener('input', (e) => this.setSpeed(Number(e.target.value)));
        }
        if (fsBtn && demoContainer && demoContainer.requestFullscreen) {
            fsBtn.addEventListener('click', () => demoContainer.requestFullscreen());
        }
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.previousScene();
                    break;
                case 'ArrowRight':
                    this.nextScene();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
            }
        });
    }
    
    startDemo() {
        this.isPlaying = true;
        this.updateURL();
        this.autoPlayInterval = setInterval(() => {
            this.nextScene();
        }, this.sceneDuration);
    }
    
    stopDemo() {
        this.isPlaying = false;
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.stopDemo();
        } else {
            this.startDemo();
        }
    }
    
    goToScene(sceneIndex) {
        if (sceneIndex < 0 || sceneIndex >= this.scenes.length) return;
        
        // Update current scene
        this.currentScene = sceneIndex;
        
        // Hide all scenes
        document.querySelectorAll('.demo-scene').forEach(scene => {
            scene.classList.remove('active');
        });
        
        // Show target scene
        const targetScene = document.getElementById(this.scenes[sceneIndex]);
        if (targetScene) {
            targetScene.classList.add('active');
        }
        
        // Update navigation dots
        document.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === sceneIndex);
        });
        
        // Update browser URL
        this.updateURL();
        
        // Add special effects for certain scenes
        this.addSceneEffects(sceneIndex);
        
        // Reset autoplay timer if playing
        if (this.isPlaying) {
            this.stopDemo();
            this.startDemo();
        }
    }
    
    updateURL() {
        const browserUrl = document.querySelector('.browser-url');
        if (browserUrl) {
        const urls = [
                'https://trackwise.com/login',
                'https://trackwise.com/dashboard', 
                'https://trackwise.com/track/DL-1PC-1234',
                'https://trackwise.com/ai-assistant',
                'https://trackwise.com/analytics',
                'https://trackwise.com/realtime-updates',
                'https://trackwise.com/feedback'
            ];
            browserUrl.textContent = urls[this.currentScene] || urls[0];
        }
    }
    
    addSceneEffects(sceneIndex) {
        switch(sceneIndex) {
            case 1: // Dashboard scene
                // Animate dashboard cards with staggered delay
                setTimeout(() => {
                    const cards = document.querySelectorAll('#dashboard-scene .dashboard-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.animation = 'bounceIn 0.8s ease-out';
                        }, index * 200);
                    });
                }, 200);
                break;
                
            case 2: // Map scene
                // Reset bus marker position
                setTimeout(() => {
                    const busMarker = document.querySelector('.bus-marker');
                    if (busMarker) {
                        busMarker.style.animation = 'none';
                        setTimeout(() => {
                            busMarker.style.animation = 'pulse 2s infinite, moveOnMap 8s linear infinite';
                        }, 100);
                    }
                }, 200);
                break;
                
            case 3: // AI Chat scene
                // Animate chat messages with delay
                setTimeout(() => {
                    const messages = document.querySelectorAll('#ai-chat-scene .chat-message');
                    messages.forEach((msg, index) => {
                        msg.style.opacity = '0';
                        msg.style.animation = 'none';
                        setTimeout(() => {
                            msg.style.animation = 'messageSlide 0.5s ease-out forwards';
                        }, index * 800);
                    });
                }, 300);
                break;
                
            case 4: // Analytics scene
                // Animate analytics cards and bars
                setTimeout(() => {
                    const cards = document.querySelectorAll('#analytics-scene .analytics-card');
                    const bars = document.querySelectorAll('#analytics-scene .bar');
                    
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.animation = 'bounceIn 0.6s ease-out';
                        }, index * 150);
                    });
                    
                    bars.forEach((bar, index) => {
                        bar.style.animation = 'none';
                        setTimeout(() => {
                            bar.style.animation = 'barGrow 1.5s ease-out';
                        }, 800 + index * 100);
                    });
                }, 200);
                break;
                
            case 5: // Updates scene
                // Restart terminal animation
                setTimeout(() => {
                    const terminalLines = document.querySelectorAll('#updates-scene .terminal-line');
                    terminalLines.forEach((line, index) => {
                        line.style.opacity = '0';
                        line.style.animation = 'none';
                        setTimeout(() => {
                            line.style.animation = `typewriter 0.5s ease-in-out forwards`;
                            line.style.animationDelay = `${index * 0.4}s`;
                        }, 100);
                    });
                }, 200);
                break;
                
            case 6: // Feedback scene
                // Animate feedback items
                setTimeout(() => {
                    const items = document.querySelectorAll('#feedback-scene .feedback-item');
                    items.forEach((item, index) => {
                        item.style.opacity = '0';
                        item.style.animation = 'none';
                        setTimeout(() => {
                            item.style.animation = 'feedbackSlide 0.6s ease-out forwards';
                        }, index * 400);
                    });
                }, 200);
                break;
        }
    }
    
    nextScene() {
        const nextIndex = (this.currentScene + 1) % this.scenes.length;
        this.goToScene(nextIndex);
    }
    
    previousScene() {
        const prevIndex = this.currentScene === 0 ? this.scenes.length - 1 : this.currentScene - 1;
        this.goToScene(prevIndex);
    }
    
    // Public methods for external control
    play() {
        if (!this.isPlaying) {
            this.startDemo();
        }
    }
    
    pause() {
        if (this.isPlaying) {
            this.stopDemo();
        }
    }
    
    reset() {
        this.stopDemo();
        this.goToScene(0);
    }
    
    setSpeed(duration) {
        this.sceneDuration = duration;
        if (this.isPlaying) {
            this.stopDemo();
            this.startDemo();
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if demo container exists
    if (document.querySelector('.video-demo-section')) {
        window.trackwiseDemo = new TrackWiseDemo();
    }
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrackWiseDemo;
}