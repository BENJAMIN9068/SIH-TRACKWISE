// TrackWise Animated Video Demo Controller

class TrackWiseDemo {
    constructor() {
        this.currentScene = 0;
        this.scenes = [
            'login-scene',
            'dashboard-scene', 
            'map-scene',
            'updates-scene'
        ];
        this.autoPlayInterval = null;
        this.isPlaying = false;
        this.sceneDuration = 4000; // 4 seconds per scene
        
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
            
            <!-- Scene 4: Real-time Updates -->
            <div class="demo-scene" id="updates-scene">
                <div class="updates-demo">
                    <h3 style="margin-bottom: 1rem;">⚡ Real-time System Updates</h3>
                    <div class="terminal-window">
                        <div class="terminal-line success">✓ GPS location updated: Bus DL-1PC-1234</div>
                        <div class="terminal-line info">ℹ Passenger count: 28/50 seats</div>
                        <div class="terminal-line warning">⚠ Traffic alert: Delay 5 minutes</div>
                        <div class="terminal-line success">✓ Route optimized automatically</div>
                        <div class="terminal-line info">ℹ ETA updated: 20 minutes</div>
                        <div class="terminal-line success">✓ Notifications sent to passengers</div>
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
            demoContainer.addEventListener('click', () => {
                this.togglePlayPause();
            });
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
                'https://trackwise.com/realtime-updates'
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
                
            case 3: // Updates scene
                // Restart terminal animation
                setTimeout(() => {
                    const terminalLines = document.querySelectorAll('#updates-scene .terminal-line');
                    terminalLines.forEach((line, index) => {
                        line.style.opacity = '0';
                        line.style.animation = 'none';
                        setTimeout(() => {
                            line.style.animation = `typewriter 0.5s ease-in-out forwards`;
                            line.style.animationDelay = `${index * 0.5}s`;
                        }, 100);
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