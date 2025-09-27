// ===== TrackWise AI Assistant Controller ===== //

const OpenAI = require('openai');

class AIChatbotController {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    this.systemPrompt = `You are TrackWise AI Assistant - a friendly, enthusiastic, and highly helpful guide for the TrackWise Smart Transportation System!
    
    LANGUAGE SUPPORT: You can communicate in both English and Hindi (हिंदी). Detect the user's language preference and respond accordingly.
    
    Your personality:
    - Be warm, welcoming, and conversational
    - Use emojis appropriately to make conversations engaging 🚌✨
    - Be proactive in offering help and suggestions
    - Speak like a knowledgeable friend, not a robot
    - Show enthusiasm about helping users navigate the system
    - Support both English and Hindi languages seamlessly
    
    PORTAL EXPERTISE - You are an expert guide for all three portals:
    
    🌟 PUBLIC PORTAL (जनता पोर्टल):
    - URL: /public/login and /public/dashboard
    - For passengers to track buses in real-time
    - Registration: Click "Register" on public login page
    - Login: Use registered email/phone and password
    - Features: Search buses, track real-time locations, view routes
    
    🚌 STAFF PORTAL (कर्मचारी पोर्टल):
    - URL: /staff/login and /staff/dashboard
    - For bus conductors and drivers
    - Login: Use staff ID and password provided by admin
    - Features: Create journeys, update GPS location, manage trips
    
    👑 ADMIN PORTAL (प्रशासक पोर्टल):
    - URL: /admin/login and /admin/dashboard
    - For system administrators
    - Login: Use admin credentials
    - Features: Monitor all buses, manage users, system analytics
    
    DETAILED GUIDANCE:
    - Always provide step-by-step instructions
    - Include specific URLs and button names
    - Explain which portal is for which user type
    - Help with login/registration issues
    - Guide users to the correct portal based on their needs
    
    Always:
    - Provide detailed, helpful responses
    - Suggest next steps after answering
    - Offer related features they might find useful
    - Use clear, simple language for beginners
    - Be patient and encouraging with new users
    - Respond in the user's preferred language (English/Hindi)`;
    
    // Initialize Hindi language support
    this.hindiResponses = this.initializeHindiResponses();
  }

  // Main chat endpoint
  async chat(req, res) {
    try {
      const { message, context = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          error: 'Message is required',
          response: 'Please provide a message to chat.' 
        });
      }

      // Check if OpenAI is available
      if (!process.env.OPENAI_API_KEY) {
        return res.json({
          response: this.getStaticResponse(message),
          source: 'static'
        });
      }

      // Prepare conversation history
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...context.map(msg => ({
          role: msg.role || 'user',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      // Get AI response
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message.content;

      res.json({
        response: aiResponse,
        source: 'openai',
        usage: completion.usage
      });

    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Fallback to static response
      res.json({
        response: this.getStaticResponse(req.body.message),
        source: 'fallback',
        error: 'AI service temporarily unavailable'
      });
    }
  }

  // Enhanced conversational responses with portal guidance and Hindi support
  getStaticResponse(message) {
    const lowerMessage = message.toLowerCase();
    const isHindi = this.detectHindiLanguage(message);
    
    // Check for portal-specific queries
    const portalResponse = this.getPortalResponse(lowerMessage, isHindi);
    if (portalResponse) return portalResponse;
    
    // Check if this might be a new user
    const isNewUser = lowerMessage.includes('new') || lowerMessage.includes('start') || 
                      lowerMessage.includes('begin') || lowerMessage.includes('first time') ||
                      lowerMessage.includes('नया') || lowerMessage.includes('शुरू');
    
    if (isNewUser) {
      return isHindi ? this.hindiResponses.welcome : `🎉 Welcome to TrackWise! I'm so excited to help you get started!
      
      TrackWise is your smart transportation companion with three amazing portals:
      
      🚌 **Staff Portal** - For bus conductors and drivers to manage journeys
      👑 **Admin Dashboard** - For monitoring the entire system
      🌟 **Public Portal** - For passengers like you to track buses in real-time!
      
      What would you like to explore first? I can:
      • Show you how to track a bus 🔍
      • Help you search for routes 🗺️
      • Guide you through our features ✨
      • Explain how to use the system 📱
      
      Just tell me what you need, and I'll walk you through it step by step!`;
    }
    
    const responses = {
      'hello': `Hey there! 👋 Welcome to TrackWise - your smart transportation assistant!
      
      I'm here to make your journey super easy! Whether you're:
      • Looking for a bus? I'll help you find it! 🚌
      • Need real-time tracking? I've got you covered! 📍
      • Planning a trip? Let's figure out the best route! 🗺️
      
      What brings you to TrackWise today? Are you a first-time user, or looking for something specific?`,
      
      'hi': `Hi there! 😊 Great to see you on TrackWise!
      
      I'm your personal transportation assistant, ready to help with anything you need!
      Quick question - are you:
      📱 A passenger looking to track buses?
      🚌 A staff member managing journeys?
      👑 An admin checking the system?
      
      Let me know, and I'll guide you to exactly where you need to go!`,
      
      'track': `🚌 Excellent! Let's track your bus together!
      
      I can help you track buses in multiple ways:
      1. **By Bus Number** - If you know the bus number (like DL-1PC-1234)
      2. **By Route** - If you know which route you're taking
      3. **By Stations** - Just tell me where you're going from and to!
      
      The tracking updates every 30 seconds, so you'll always know exactly where your bus is!
      
      Which method would you prefer? Just type the bus number, route, or your starting and ending stations!`,
      
      'route': `🗺️ Perfect! Let's find the best route for you!
      
      TrackWise makes route planning super easy. Here's how:
      
      📍 **Step 1**: Tell me your starting point (like "Central Station")
      📍 **Step 2**: Tell me where you want to go (your destination)
      📍 **Step 3**: I'll show you all available buses and their current locations!
      
      You can also see:
      • Estimated arrival times ⏰
      • Live bus positions on the map 🗺️
      • Alternative routes if available 🔄
      
      So, where are you starting from today?`,
      
      'help': `🌟 I'm here to help! TrackWise is packed with amazing features!
      
      Here's everything I can help you with:
      
      **🚌 For Passengers:**
      • Search buses between any two stations
      • Track buses in real-time (updates every 30 seconds!)
      • View live locations on interactive maps
      • Get estimated arrival times
      
      **👨‍💼 For Staff:**
      • Create and manage bus journeys
      • Update GPS location automatically
      • View journey history and statistics
      
      **👑 For Admins:**
      • Monitor all active buses
      • Manage user databases
      • View system analytics
      
      **✨ Cool Features:**
      • Dark/Light theme toggle (easy on the eyes!)
      • Works offline once loaded
      • Install as a mobile app
      • Super fast and responsive
      
      What would you like to try first? I'll guide you through it!`,
      
      'default': `🤔 Interesting question! Let me help you with TrackWise!
      
      I'm your friendly AI assistant, and I'm here to make sure you have the best experience possible!
      
      Here are some things you might want to know:
      • How to track a specific bus 🚌
      • Finding the best route for your journey 🗺️
      • Understanding our real-time GPS system 📍
      • Using the mobile app features 📱
      
      Could you tell me a bit more about what you're looking for? Or would you like me to give you a quick tour of the system?`
    };
    
    // Find matching response (including Hindi triggers)
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key) || this.matchesHindiKeyword(lowerMessage, key)) {
        return response;
      }
    }
    
    // If the user is using Hindi, provide Hindi default
    if (isHindi) {
      return this.hindiResponses.default;
    }
    
    return responses.default;
    
    // Find matching response
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return responses.default;
  }

  // Get bus suggestions based on query
  async getBusSuggestions(req, res) {
    try {
      const { from, to, query } = req.query;
      
      // This would typically query your bus database
      // For now, return mock suggestions
      const suggestions = [
        {
          id: 'bus_001',
          busNumber: 'DL-1PC-1234',
          route: `${from} → ${to}`,
          estimatedTime: '45 minutes',
          nextStop: 'Central Station',
          confidence: 0.95
        },
        {
          id: 'bus_002', 
          busNumber: 'DL-1PC-5678',
          route: `${from} → Downtown → ${to}`,
          estimatedTime: '60 minutes',
          nextStop: 'Market Square',
          confidence: 0.87
        }
      ];

      res.json({
        suggestions,
        query,
        from,
        to
      });

    } catch (error) {
      console.error('Bus Suggestions Error:', error);
      res.status(500).json({ error: 'Failed to get bus suggestions' });
    }
  }

  // Get contextual help based on current page
  async getContextualHelp(req, res) {
    try {
      const { page, userType } = req.query;
      
      const helpContent = {
        'staff': {
          'dashboard': 'Welcome to the staff dashboard! Here you can create new journeys, update your location, and manage your current trips.',
          'journey': 'Use this form to start a new journey. Fill in all required details and make sure GPS is enabled for tracking.',
          'profile': 'Update your profile information and manage your account settings here.'
        },
        'admin': {
          'dashboard': 'Admin dashboard shows system overview with live statistics. Monitor all active buses and user activity.',
          'buses': 'View all running buses with real-time locations. Click on any bus for detailed information.',
          'users': 'Manage staff and public user accounts. View registration data and activity logs.'
        },
        'public': {
          'search': 'Enter your starting point and destination to find available buses. Results show live bus locations.',
          'track': 'Track specific buses by entering the bus number. View real-time location on the map.',
          'routes': 'Browse all available routes and their schedules. Plan your journey efficiently.'
        }
      };

      const help = helpContent[userType]?.[page] || 'I\'m here to help! Ask me anything about the bus tracking system.';
      
      res.json({ help, page, userType });

    } catch (error) {
      console.error('Contextual Help Error:', error);
      res.status(500).json({ error: 'Failed to get help content' });
    }
  }

  // Train the AI with system-specific data
  async trainWithBusData(_busData, _routes, _schedules) {
    // This would be used to fine-tune responses with real system data
    // Implementation depends on your specific AI training approach
    console.log('Training AI with bus system data...');
  }
  
  // Initialize Hindi language responses
  initializeHindiResponses() {
    return {
      welcome: `🎉 ट्रैकवाइज़ में आपका स्वागत है! मुझे आपकी मदद करने में बहुत खुशी होगी!
      
      ट्रैकवाइज़ आपका स्मार्ट परिवहन साथी है, जिसमें तीन उत्कृष्ट पोर्टल हैं:
      
      🚌 **स्टाफ पोर्टल** - बस कंडक्टरों और ड्राइवरों के लिए यात्राओं का प्रबंधन करने के लिए
      👑 **एडमिन डैशबोर्ड** - पूरे सिस्टम की निगरानी के लिए
      🌟 **पब्लिक पोर्टल** - यात्रियों के लिए बसों को रियल-टाइम में ट्रैक करने के लिए!
      
      आप सबसे पहले क्या देखना चाहेंगे? मैं आपकी मदद कर सकता हूँ:
      • बस ट्रैक करने का तरीका दिखाना 🔍
      • रूट्स खोजने में मदद करना 🗺️
      • हमारी सुविधाओं के बारे में बताना ✨
      • सिस्टम का उपयोग करने का तरीका समझाना 📱
      
      बस मुझे बताएं आपको क्या चाहिए, और मैं आपको चरण दर चरण मार्गदर्शन करूंगा!`,
      
      login: `🔐 ट्रैकवाइज़ पर लॉगिन करने के लिए यहां बताया गया है:
      
      **पब्लिक पोर्टल लॉगिन** (यात्रियों के लिए):
      1. "/public/login" पर जाएं
      2. अपना पंजीकृत ईमेल/फोन और पासवर्ड दर्ज करें
      3. "लॉगिन" बटन पर क्लिक करें
      4. रजिस्टर करने के लिए "रजिस्टर" लिंक पर क्लिक करें
      
      **स्टाफ पोर्टल लॉगिन** (कर्मचारियों के लिए):
      1. "/staff/login" पर जाएं
      2. आपको प्रशासक द्वारा प्रदान किए गए स्टाफ आईडी और पासवर्ड का उपयोग करें
      3. "लॉगिन" पर क्लिक करें
      
      **एडमिन पोर्टल लॉगिन** (प्रशासकों के लिए):
      1. "/admin/login" पर जाएं
      2. एडमिन क्रेडेंशियल्स दर्ज करें
      3. "लॉगिन" पर क्लिक करें
      
      क्या आप इनमें से किसी विशेष पोर्टल के लिए मदद चाहते हैं?`,
      
      register: `📝 ट्रैकवाइज़ पर रजिस्टर करने के लिए यहां बताया गया है:
      
      **पब्लिक पोर्टल रजिस्ट्रेशन** (यात्रियों के लिए):
      1. "/public/login" पर जाएं
      2. "रजिस्टर" लिंक पर क्लिक करें
      3. अपना नाम, ईमेल/फोन नंबर दर्ज करें
      4. एक मजबूत पासवर्ड बनाएं
      5. "रजिस्टर" बटन पर क्लिक करें
      
      **स्टाफ रजिस्ट्रेशन**:
      स्टाफ अकाउंट्स केवल एडमिन द्वारा बनाए जा सकते हैं। स्टाफ के रूप में पंजीकरण के लिए अपने प्रशासक से संपर्क करें।
      
      **एडमिन रजिस्ट्रेशन**:
      एडमिन अकाउंट्स सिस्टम प्रशासक द्वारा प्रबंधित किए जाते हैं। अधिक जानकारी के लिए सिस्टम प्रशासक से संपर्क करें।
      
      क्या मैं आपकी किसी अन्य मदद कर सकता हूँ?`,
      
      default: `🤔 आपका प्रश्न दिलचस्प है! मैं आपकी ट्रैकवाइज़ के साथ मदद करूंगा!
      
      मैं आपका दोस्त AI सहायक हूँ, और मैं आपको सर्वोत्तम अनुभव देने के लिए यहां हूँ!
      
      यहां कुछ चीजें हैं जो आप जानना चाह सकते हैं:
      • किसी विशेष बस को कैसे ट्रैक करें 🚌
      • अपनी यात्रा के लिए सबसे अच्छा रूट कैसे खोजें 🗺️
      • हमारे रीयल-टाइम GPS सिस्टम को कैसे समझें 📍
      • मोबाइल ऐप सुविधाओं का उपयोग कैसे करें 📱
      
      क्या आप मुझे बता सकते हैं कि आप किस बारे में अधिक जानना चाहते हैं? या क्या आप चाहते हैं कि मैं आपको सिस्टम का एक त्वरित टूर दूँ?`
    };
  }

  // Detect if the message is in Hindi
  detectHindiLanguage(message) {
    // Hindi unicode range: \u0900-\u097F
    const hindiPattern = /[\u0900-\u097F]/;
    return hindiPattern.test(message);
  }

  // Match Hindi keywords to English functions
  matchesHindiKeyword(message, englishKeyword) {
    const hindiKeywords = {
      'hello': ['नमस्ते', 'नमस्कार', 'हैलो'],
      'hi': ['हाय', 'सुप्रभात', 'हेलो'],
      'help': ['मदद', 'सहायता', 'सहारा'],
      'track': ['ट्रैक', 'खोज', 'पता लगाओ', 'बस कहां है'],
      'route': ['मार्ग', 'रूट', 'रास्ता', 'कैसे जाएं']
    };

    const keywords = hindiKeywords[englishKeyword] || [];
    return keywords.some(keyword => message.includes(keyword));
  }

  // Get specific responses for portal-related questions
  getPortalResponse(message, isHindi) {
    // Check for login-related questions
    if (message.includes('login') || 
        message.includes('sign in') || 
        message.includes('how to login') ||
        message.includes('लॉगिन') || 
        message.includes('साइन इन') || 
        message.includes('कैसे लॉगिन करें')) {
      
      return isHindi ? this.hindiResponses.login : this.getLoginGuidance(message);
    }
    
    // Check for registration-related questions
    if (message.includes('register') || 
        message.includes('sign up') || 
        message.includes('create account') ||
        message.includes('रजिस्टर') || 
        message.includes('साइन अप') || 
        message.includes('अकाउंट बनाएं')) {
      
      return isHindi ? this.hindiResponses.register : this.getRegistrationGuidance(message);
    }
    
    // Check for portal-specific questions
    if ((message.includes('which portal') || message.includes('what portal') || 
         message.includes('portal for') || message.includes('कौन सा पोर्टल') || 
         message.includes('पोर्टल किसके लिए')) && 
        (message.includes('use') || message.includes('using') || message.includes('उपयोग'))) {
      
      return this.getPortalGuidance(message, isHindi);
    }
    
    return null; // No specific portal response needed
  }

  // Provide guidance about login processes
  getLoginGuidance(message) {
    // Check for specific portal login questions
    if (message.includes('staff')) {
      return `🔑 To login to the Staff Portal:
      
      1. Navigate to "/staff/login"
      2. Enter your Staff ID provided by admin
      3. Enter your password
      4. Click "Login"
      
      If you forgot your password, use the "Forgot Password" link or contact your administrator.
      
      Staff accounts are created by administrators - you cannot self-register as staff.`;
    }
    
    if (message.includes('admin')) {
      return `👑 To login to the Admin Portal:
      
      1. Navigate to "/admin/login"
      2. Enter your admin username
      3. Enter your admin password
      4. Click "Login"
      
      Admin accounts are strictly controlled. If you need admin access, please contact the system administrator.
      
      Admin portal provides system-wide management tools and should only be accessed by authorized personnel.`;
    }
    
    if (message.includes('public') || message.includes('passenger')) {
      return `🌟 To login to the Public Portal:
      
      1. Navigate to "/public/login"
      2. Enter your registered email or phone number
      3. Enter your password
      4. Click "Login"
      
      If you're a new user, click "Register" to create an account.
      
      Forgot your password? Use the "Reset Password" link on the login page to reset it via email or SMS.`;
    }
    
    // General login guidance
    return `🔐 Here's how to login to TrackWise:
    
    **Public Portal Login** (for passengers):
    1. Go to "/public/login"
    2. Enter your registered email/phone and password
    3. Click "Login"
    4. For new users, click "Register" to create an account
    
    **Staff Portal Login** (for conductors/drivers):
    1. Go to "/staff/login"
    2. Use Staff ID and password provided by admin
    3. Click "Login"
    
    **Admin Portal Login** (for administrators):
    1. Go to "/admin/login"
    2. Enter admin credentials
    3. Click "Login"
    
    Which specific portal do you need help with?`;
  }

  // Provide guidance about registration processes
  getRegistrationGuidance(message) {
    // Check for specific portal registration questions
    if (message.includes('staff')) {
      return `🚌 About Staff Registration:
      
      Staff accounts can only be created by administrators. You cannot self-register as a conductor or driver.
      
      To get a staff account:
      1. Contact the system administrator or your manager
      2. Provide your required details (name, ID proof, etc.)
      3. Once your account is created, you'll receive your Staff ID and initial password
      4. You can then login at "/staff/login"
      
      First-time login will require you to change your password.`;
    }
    
    if (message.includes('public') || message.includes('passenger')) {
      return `🌟 To register on the Public Portal:
      
      1. Go to "/public/login"
      2. Click the "Register" link
      3. Fill in your details:
         - Full Name
         - Email Address or Phone Number
         - Create a strong password
         - Confirm password
      4. Accept terms and conditions
      5. Click "Register"
      6. Verify your email/phone if required
      
      Once registered, you can login and start tracking buses, searching routes, and using all passenger features!`;
    }
    
    // General registration guidance
    return `📝 Here's how to register with TrackWise:
    
    **Public Portal Registration** (for passengers):
    1. Go to "/public/login"
    2. Click the "Register" link
    3. Enter your name, email/phone number
    4. Create a strong password
    5. Click "Register"
    
    **Staff Registration**:
    Staff accounts are created only by admins. Contact your administrator for staff registration.
    
    **Admin Registration**:
    Admin accounts are managed by the system administrator. Contact the system administrator for more information.
    
    Can I help you with anything else?`;
  }

  // Provide guidance about which portal to use
  getPortalGuidance(message, isHindi) {
    if (isHindi) {
      return `🚌 ट्रैकवाइज़ में 3 अलग-अलग पोर्टल हैं:
      
      1️⃣ **पब्लिक पोर्टल** - यात्रियों के लिए (/public/login):
      • बसों को ट्रैक करने के लिए
      • बस रूट खोजने के लिए
      • अपनी यात्रा की योजना बनाने के लिए
      • जीपीएस पर लाइव बस स्थान देखने के लिए
      
      2️⃣ **स्टाफ पोर्टल** - कंडक्टरों और ड्राइवरों के लिए (/staff/login):
      • बस यात्राएं शुरू करने के लिए
      • अपनी बस की लोकेशन अपडेट करने के लिए
      • यात्रियों के विवरण प्रबंधित करने के लिए
      • जर्नी हिस्ट्री देखने के लिए
      
      3️⃣ **एडमिन पोर्टल** - प्रशासकों के लिए (/admin/login):
      • सभी बसों की निगरानी करने के लिए
      • उपयोगकर्ता प्रबंधन के लिए
      • सिस्टम एनालिटिक्स देखने के लिए
      • स्टाफ अकाउंट्स बनाने के लिए
      
      आप क्या करना चाहते हैं? मैं आपको सही पोर्टल पर मार्गदर्शित कर सकता हूँ!`;
    }
    
    return `🚌 TrackWise has 3 different portals:
    
    1️⃣ **Public Portal** - for passengers (/public/login):
    • For tracking buses
    • Searching bus routes
    • Planning your journey
    • Viewing live bus locations on GPS
    
    2️⃣ **Staff Portal** - for conductors & drivers (/staff/login):
    • Starting bus journeys
    • Updating bus location
    • Managing passenger details
    • Viewing journey history
    
    3️⃣ **Admin Portal** - for administrators (/admin/login):
    • Monitoring all buses
    • User management
    • System analytics
    • Creating staff accounts
    
    What are you trying to do? I can guide you to the right portal!`;
  }
}

module.exports = AIChatbotController;
