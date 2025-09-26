<?php
// Modern Bus Tracking System - PHP Version for cPanel
// This version works on ANY cPanel hosting without Node.js

session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database Configuration - CHANGE THESE TO YOUR cPanel DATABASE DETAILS
$config = [
    'db_host' => 'localhost',
    'db_user' => 'yourusername_busadmin',  // CHANGE THIS
    'db_pass' => 'your_password_here',     // CHANGE THIS  
    'db_name' => 'yourusername_bustrak',   // CHANGE THIS
    'site_url' => 'https://yourdomain.com', // CHANGE THIS
];

// Database Connection
try {
    $pdo = new PDO(
        "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
        $config['db_user'],
        $config['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Simple Router
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Handle different routes
switch ($path) {
    case '/':
    case '':
        showHomepage();
        break;
    case '/staff':
        showStaffLogin();
        break;
    case '/admin':
        showAdminLogin();
        break;
    case '/public':
        showPublicPortal();
        break;
    case '/api/chat':
        if ($method === 'POST') {
            handleChatAPI();
        }
        break;
    case '/api/login':
        if ($method === 'POST') {
            handleLogin();
        }
        break;
    case '/api/buses':
        getBuses();
        break;
    default:
        show404();
        break;
}

// Homepage Function
function showHomepage() {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🚌 Modern Bus Tracking System - PHP Version</title>
        
        <!-- Stylesheets -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        
        <style>
            :root {
                --bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                --accent-color: #667eea;
                --text-primary: #2d3748;
                --glass-bg: rgba(255, 255, 255, 0.15);
                --shadow-medium: 0 12px 40px rgba(102, 126, 234, 0.2);
            }
            
            body {
                font-family: 'Inter', sans-serif;
                background: var(--bg-primary);
                color: var(--text-primary);
                min-height: 100vh;
            }
            
            .glass-card {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                padding: 2rem;
                box-shadow: var(--shadow-medium);
                transition: all 0.3s ease;
            }
            
            .glass-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
            }
            
            .btn-modern {
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 12px 24px;
                font-weight: 600;
                text-decoration: none;
                display: inline-block;
                transition: all 0.3s ease;
            }
            
            .btn-modern:hover {
                transform: translateY(-3px);
                color: white;
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
            }
            
            .hero-badge {
                background: var(--accent-color);
                color: white;
                padding: 8px 16px;
                border-radius: 25px;
                font-size: 0.9rem;
                margin: 0 5px;
            }
            
            .feature-icon {
                width: 80px;
                height: 80px;
                background: linear-gradient(45deg, #667eea, #764ba2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1rem;
            }
        </style>
    </head>
    <body>
        <!-- Main Hero Section -->
        <div class="min-vh-100 d-flex align-items-center justify-content-center">
            <div class="container">
                <!-- Hero Header -->
                <div class="text-center mb-5">
                    <h1 class="display-3 fw-bold text-white mb-4">
                        <i class="fas fa-bus me-3"></i>Modern Bus Tracking
                    </h1>
                    <p class="lead text-white mb-4">Experience the future of transportation with smart tracking</p>
                    <div class="d-flex justify-content-center flex-wrap gap-2 mb-4">
                        <span class="hero-badge"><i class="fas fa-database me-1"></i>PHP + MySQL</span>
                        <span class="hero-badge"><i class="fas fa-mobile-alt me-1"></i>Mobile Ready</span>
                        <span class="hero-badge"><i class="fas fa-server me-1"></i>cPanel Compatible</span>
                    </div>
                </div>
                
                <!-- Access Cards -->
                <div class="row g-4 justify-content-center">
                    <div class="col-lg-4 col-md-6">
                        <div class="glass-card text-center">
                            <div class="feature-icon">
                                <i class="fas fa-users fa-2x text-white"></i>
                            </div>
                            <h3 class="fw-bold mb-3 text-white">Staff Portal</h3>
                            <p class="mb-4 text-white-75">Journey management for conductors and drivers with GPS tracking</p>
                            <a href="/staff" class="btn-modern w-100">
                                <i class="fas fa-sign-in-alt me-2"></i>Enter Staff Portal
                            </a>
                        </div>
                    </div>
                    
                    <div class="col-lg-4 col-md-6">
                        <div class="glass-card text-center">
                            <div class="feature-icon">
                                <i class="fas fa-crown fa-2x text-white"></i>
                            </div>
                            <h3 class="fw-bold mb-3 text-white">Admin Dashboard</h3>
                            <p class="mb-4 text-white-75">System monitoring with analytics and user management</p>
                            <a href="/admin" class="btn-modern w-100">
                                <i class="fas fa-shield-alt me-2"></i>Admin Control
                            </a>
                        </div>
                    </div>
                    
                    <div class="col-lg-4 col-md-6">
                        <div class="glass-card text-center">
                            <div class="feature-icon">
                                <i class="fas fa-map-marked-alt fa-2x text-white"></i>
                            </div>
                            <h3 class="fw-bold mb-3 text-white">Public Access</h3>
                            <p class="mb-4 text-white-75">Smart bus search and live tracking for passengers</p>
                            <a href="/public" class="btn-modern w-100">
                                <i class="fas fa-search me-2"></i>Find Your Bus
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- Features Row -->
                <div class="row mt-5 pt-5">
                    <div class="col-12 text-center mb-4">
                        <h2 class="fw-bold text-white">System Features</h2>
                    </div>
                    <div class="col-md-3 text-center mb-3">
                        <i class="fas fa-database fa-3x text-white mb-3"></i>
                        <h5 class="text-white">MySQL Database</h5>
                        <p class="text-white-75 small">Reliable data storage</p>
                    </div>
                    <div class="col-md-3 text-center mb-3">
                        <i class="fas fa-mobile-alt fa-3x text-white mb-3"></i>
                        <h5 class="text-white">Mobile Friendly</h5>
                        <p class="text-white-75 small">Responsive design</p>
                    </div>
                    <div class="col-md-3 text-center mb-3">
                        <i class="fas fa-map fa-3x text-white mb-3"></i>
                        <h5 class="text-white">GPS Tracking</h5>
                        <p class="text-white-75 small">Real-time location</p>
                    </div>
                    <div class="col-md-3 text-center mb-3">
                        <i class="fas fa-server fa-3x text-white mb-3"></i>
                        <h5 class="text-white">cPanel Ready</h5>
                        <p class="text-white-75 small">Easy deployment</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Simple AI Chat Widget -->
        <div id="chatWidget" class="position-fixed bottom-0 end-0 m-4" style="z-index: 1000;">
            <button id="chatToggle" class="btn btn-primary rounded-circle p-3">
                <i class="fas fa-comments fa-lg"></i>
            </button>
            <div id="chatBox" class="card mt-2 d-none" style="width: 300px; height: 400px;">
                <div class="card-header bg-primary text-white">
                    <i class="fas fa-robot me-2"></i>Bus Assistant
                </div>
                <div class="card-body d-flex flex-column">
                    <div id="chatMessages" class="flex-grow-1 overflow-auto mb-3">
                        <div class="alert alert-info small">
                            Hi! I'm your bus tracking assistant. Ask me anything!
                        </div>
                    </div>
                    <div class="input-group">
                        <input type="text" id="chatInput" class="form-control" placeholder="Ask me...">
                        <button id="chatSend" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Scripts -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script>
            // Simple Chat Widget
            document.getElementById('chatToggle').addEventListener('click', function() {
                const chatBox = document.getElementById('chatBox');
                chatBox.classList.toggle('d-none');
            });
            
            document.getElementById('chatSend').addEventListener('click', sendMessage);
            document.getElementById('chatInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') sendMessage();
            });
            
            function sendMessage() {
                const input = document.getElementById('chatInput');
                const message = input.value.trim();
                if (!message) return;
                
                // Add user message
                addMessage(message, 'user');
                input.value = '';
                
                // Send to PHP backend
                fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({message: message})
                })
                .then(response => response.json())
                .then(data => {
                    addMessage(data.response, 'bot');
                })
                .catch(error => {
                    addMessage('Sorry, I encountered an error. Please try again.', 'bot');
                });
            }
            
            function addMessage(message, sender) {
                const messagesDiv = document.getElementById('chatMessages');
                const messageDiv = document.createElement('div');
                messageDiv.className = sender === 'user' ? 'text-end mb-2' : 'text-start mb-2';
                messageDiv.innerHTML = `<div class="badge bg-${sender === 'user' ? 'primary' : 'secondary'} p-2">${message}</div>`;
                messagesDiv.appendChild(messageDiv);
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
        </script>
    </body>
    </html>
    <?php
}

// Staff Login Page
function showStaffLogin() {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Staff Login - Bus Tracking</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .glass-card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; }
        </style>
    </head>
    <body class="d-flex align-items-center justify-content-center">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="glass-card p-5">
                        <div class="text-center mb-4">
                            <i class="fas fa-users fa-3x text-white mb-3"></i>
                            <h2 class="text-white">Staff Login</h2>
                            <p class="text-white-75">For conductors and drivers</p>
                        </div>
                        <form id="staffLoginForm">
                            <div class="mb-3">
                                <label class="form-label text-white">Employee ID</label>
                                <input type="text" class="form-control" id="employeeId" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-white">Password</label>
                                <input type="password" class="form-control" id="password" required>
                            </div>
                            <button type="submit" class="btn btn-light w-100 mb-3">
                                <i class="fas fa-sign-in-alt me-2"></i>Login
                            </button>
                        </form>
                        <div class="text-center">
                            <a href="/" class="text-white">← Back to Home</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    <?php
}

// Admin Login Page  
function showAdminLogin() {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - Bus Tracking</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .glass-card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; }
        </style>
    </head>
    <body class="d-flex align-items-center justify-content-center">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="glass-card p-5">
                        <div class="text-center mb-4">
                            <i class="fas fa-crown fa-3x text-white mb-3"></i>
                            <h2 class="text-white">Admin Access</h2>
                            <p class="text-white-75">System administration</p>
                        </div>
                        <form>
                            <div class="mb-3">
                                <label class="form-label text-white">Admin ID</label>
                                <input type="text" class="form-control" value="BCS2024261" readonly>
                                <small class="text-white-50">Default: BCS2024261</small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-white">Password</label>
                                <input type="password" class="form-control" value="BCS2024261" readonly>
                                <small class="text-white-50">Default: BCS2024261</small>
                            </div>
                            <button type="button" class="btn btn-light w-100 mb-3" onclick="alert('Admin dashboard coming soon!')">
                                <i class="fas fa-shield-alt me-2"></i>Access Dashboard
                            </button>
                        </form>
                        <div class="text-center">
                            <a href="/" class="text-white">← Back to Home</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    <?php
}

// Public Portal
function showPublicPortal() {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Public Portal - Bus Tracking</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .glass-card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px; }
        </style>
    </head>
    <body>
        <div class="container py-5">
            <div class="text-center mb-5">
                <h1 class="text-white"><i class="fas fa-map-marked-alt me-3"></i>Public Bus Search</h1>
                <p class="text-white-75">Find buses and track live locations</p>
            </div>
            
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="glass-card p-4 mb-4">
                        <h3 class="text-white mb-3">Search Buses</h3>
                        <form id="busSearchForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-white">From</label>
                                    <input type="text" class="form-control" id="fromStation" placeholder="Starting point">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label text-white">To</label>
                                    <input type="text" class="form-control" id="toStation" placeholder="Destination">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-light">
                                <i class="fas fa-search me-2"></i>Search Buses
                            </button>
                        </form>
                    </div>
                    
                    <div id="searchResults" class="glass-card p-4">
                        <h4 class="text-white">Available Buses</h4>
                        <div id="busListings">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                Enter your starting point and destination to search for buses.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-4">
                <a href="/" class="text-white">← Back to Home</a>
            </div>
        </div>
        
        <script>
            document.getElementById('busSearchForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const from = document.getElementById('fromStation').value;
                const to = document.getElementById('toStation').value;
                
                if (!from || !to) {
                    alert('Please enter both starting point and destination');
                    return;
                }
                
                // Show sample results
                document.getElementById('busListings').innerHTML = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">Bus #DL-1PC-1234</h5>
                            <p class="card-text">Route: ${from} → ${to}</p>
                            <p class="text-muted">Estimated Time: 45 minutes</p>
                            <button class="btn btn-primary btn-sm">Track Live</button>
                        </div>
                    </div>
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">Bus #DL-1PC-5678</h5>
                            <p class="card-text">Route: ${from} → Downtown → ${to}</p>
                            <p class="text-muted">Estimated Time: 60 minutes</p>
                            <button class="btn btn-primary btn-sm">Track Live</button>
                        </div>
                    </div>
                `;
            });
        </script>
    </body>
    </html>
    <?php
}

// Chat API Handler
function handleChatAPI() {
    header('Content-Type: application/json');
    
    $input = json_decode(file_get_contents('php://input'), true);
    $message = $input['message'] ?? '';
    
    // Simple chatbot responses
    $responses = [
        'hello' => 'Hi there! 👋 I\'m your bus tracking assistant. How can I help you today?',
        'hi' => 'Hello! I\'m here to help with all your bus tracking needs.',
        'track' => '🚍 I can help you track buses! Please provide the bus number or route.',
        'route' => '🗺️ Looking for route information? Which stations are you traveling between?',
        'time' => '⏰ Bus schedules vary by route. Which specific route do you need timing for?',
        'help' => '🆘 I can help with:\n• Finding bus routes\n• Real-time tracking\n• Schedule information',
        'staff' => '👨‍💼 Staff portal is for conductors and drivers. Are you a staff member?',
        'admin' => '🔐 Admin dashboard provides system monitoring. Do you have admin access?',
        'public' => '🌐 Public portal lets you search and track buses. Perfect for passengers!',
        'php' => '💻 This system runs on PHP with MySQL - perfect for cPanel hosting!',
        'default' => '🤖 I can help you with bus tracking! Ask me about routes, schedules, or system features.'
    ];
    
    $lowerMessage = strtolower($message);
    $response = $responses['default'];
    
    foreach ($responses as $keyword => $reply) {
        if (strpos($lowerMessage, $keyword) !== false) {
            $response = $reply;
            break;
        }
    }
    
    echo json_encode(['response' => $response]);
}

// Get Buses API
function getBuses() {
    global $pdo;
    header('Content-Type: application/json');
    
    try {
        $stmt = $pdo->query("SELECT * FROM journeys WHERE status = 'running' LIMIT 10");
        $buses = $stmt->fetchAll();
        echo json_encode(['success' => true, 'buses' => $buses]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

// 404 Page
function show404() {
    http_response_code(404);
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Page Not Found</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        </style>
    </head>
    <body class="d-flex align-items-center justify-content-center text-white">
        <div class="text-center">
            <h1 class="display-1">404</h1>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/" class="btn btn-light">Go Home</a>
        </div>
    </body>
    </html>
    <?php
}
?>
