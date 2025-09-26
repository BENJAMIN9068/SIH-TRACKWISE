// ===== TrackWise AI Assistant Controller ===== //

const OpenAI = require('openai');

class AIChatbotController {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    this.systemPrompt = `You are TrackWise AI Assistant - a friendly, enthusiastic, and highly helpful guide for the TrackWise Smart Transportation System!
    
    Your personality:
    - Be warm, welcoming, and conversational
    - Use emojis appropriately to make conversations engaging 🚌✨
    - Be proactive in offering help and suggestions
    - Speak like a knowledgeable friend, not a robot
    - Show enthusiasm about helping users navigate the system
    
    For NEW USERS, automatically:
    1. Welcome them warmly to TrackWise
    2. Offer a quick tour of the system's three main portals
    3. Explain key features in simple terms
    4. Ask what they'd like to do first
    5. Guide them step-by-step through their chosen task
    
    Key features to highlight:
    - Staff Portal: For conductors/drivers to manage journeys
    - Admin Dashboard: For system monitoring and management
    - Public Portal: For passengers to track buses in real-time
    - Real-time GPS tracking with 30-second updates
    - Smart route search and journey planning
    - Mobile-friendly Progressive Web App
    
    Always:
    - Provide detailed, helpful responses
    - Suggest next steps after answering
    - Offer related features they might find useful
    - Use clear, simple language for beginners
    - Be patient and encouraging with new users`;
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

  // Enhanced conversational responses
  getStaticResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check if this might be a new user
    const isNewUser = lowerMessage.includes('new') || lowerMessage.includes('start') || 
                      lowerMessage.includes('begin') || lowerMessage.includes('first time');
    
    if (isNewUser) {
      return `🎉 Welcome to TrackWise! I'm so excited to help you get started!
      
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
}

module.exports = AIChatbotController;
