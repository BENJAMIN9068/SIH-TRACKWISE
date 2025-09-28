const PptxGenJS = require('pptxgenjs');

// Create new presentation
let pres = new PptxGenJS();

// Set presentation properties
pres.author = 'Team Dynamite';
pres.company = 'TrackWise';
pres.subject = 'SIH 2024 - TrackWise Smart Transportation System';
pres.title = 'TrackWise - Smart Transportation System';

console.log('🔄 Creating professional TrackWise presentation...');

// SLIDE 1: Title Slide
let slide1 = pres.addSlide();
slide1.background = { color: '667eea' };

slide1.addText('🚌 TrackWise', {
    x: 1, y: 1.5, w: 8, h: 1,
    fontSize: 48, bold: true, color: 'ffffff', align: 'center'
});

slide1.addText('Smart Transportation System with AI Assistant', {
    x: 1, y: 2.8, w: 8, h: 0.8,
    fontSize: 24, color: 'ffffff', align: 'center'
});

slide1.addShape(pres.ShapeType.roundRect, {
    x: 3, y: 4, w: 4, h: 0.8,
    fill: 'f093fb'
});

slide1.addText('SIH 2024 Submission', {
    x: 3, y: 4.1, w: 4, h: 0.6,
    fontSize: 18, bold: true, color: 'ffffff', align: 'center'
});

slide1.addText('Team Dynamite', {
    x: 1, y: 5.5, w: 8, h: 0.6,
    fontSize: 20, bold: true, color: 'ffffff', align: 'center'
});

// Key features
const features = ['Real-time GPS', 'AI Assistant', 'Multi-Portal', 'PWA Ready'];
features.forEach((feature, index) => {
    slide1.addShape(pres.ShapeType.roundRect, {
        x: 0.5 + (index * 2.25), y: 6.3, w: 2, h: 0.5,
        fill: 'ffffff'
    });
    
    slide1.addText(feature, {
        x: 0.5 + (index * 2.25), y: 6.35, w: 2, h: 0.4,
        fontSize: 12, color: '667eea', align: 'center', bold: true
    });
});

// SLIDE 2: Problem Statement
let slide2 = pres.addSlide();
slide2.background = { color: 'f8fafc' };

slide2.addText('🎯 Problem Statement', {
    x: 0.5, y: 0.5, w: 9, h: 0.8,
    fontSize: 32, bold: true, color: '2d3748', align: 'center'
});

slide2.addText('Current challenges in public transportation:', {
    x: 1, y: 1.5, w: 8, h: 0.6,
    fontSize: 18, color: '2d3748'
});

const problems = [
    '❌ Lack of real-time bus location tracking',
    '⏰ Uncertain arrival times causing passenger frustration',
    '📱 No unified platform for all transportation needs',
    '🤔 Difficulty in route planning and bus selection',
    '📊 Poor system monitoring and analytics for operators'
];

problems.forEach((problem, index) => {
    slide2.addShape(pres.ShapeType.roundRect, {
        x: 1, y: 2.3 + (index * 0.8), w: 0.6, h: 0.6,
        fill: 'ed8936'
    });
    
    slide2.addText(problem, {
        x: 1.8, y: 2.4 + (index * 0.8), w: 7, h: 0.6,
        fontSize: 16, color: '2d3748'
    });
});

// SLIDE 3: TrackWise Solution
let slide3 = pres.addSlide();
slide3.background = { color: 'f8fafc' };

slide3.addText('💡 TrackWise Solution', {
    x: 0.5, y: 0.5, w: 9, h: 0.8,
    fontSize: 32, bold: true, color: '2d3748', align: 'center'
});

// Central TrackWise box
slide3.addShape(pres.ShapeType.roundRect, {
    x: 3.5, y: 2, w: 3, h: 1.5,
    fill: '667eea'
});

slide3.addText('🚌\nTrackWise', {
    x: 3.5, y: 2.1, w: 3, h: 1.3,
    fontSize: 20, bold: true, color: 'ffffff', align: 'center'
});

// Solution components
const solutions = [
    { x: 1, y: 1, text: '📱 PWA App\nInstant Access', fill: '4299e1' },
    { x: 7, y: 1, text: '🤖 AI Assistant\nSmart Guidance', fill: '48bb78' },
    { x: 1, y: 4, text: '📍 Real-time GPS\n30-sec Updates', fill: 'ed8936' },
    { x: 7, y: 4, text: '🎯 Multi-Portal\nAll User Types', fill: 'f093fb' }
];

solutions.forEach(solution => {
    slide3.addShape(pres.ShapeType.roundRect, {
        x: solution.x, y: solution.y, w: 2.2, h: 1.2,
        fill: solution.fill
    });
    
    slide3.addText(solution.text, {
        x: solution.x, y: solution.y + 0.1, w: 2.2, h: 1,
        fontSize: 14, bold: true, color: 'ffffff', align: 'center'
    });
});

// SLIDE 4: System Architecture
let slide4 = pres.addSlide();
slide4.background = { color: 'f8fafc' };

slide4.addText('🏗️ System Architecture', {
    x: 0.5, y: 0.5, w: 9, h: 0.8,
    fontSize: 32, bold: true, color: '2d3748', align: 'center'
});

// Frontend layer
slide4.addShape(pres.ShapeType.roundRect, {
    x: 1, y: 1.5, w: 8, h: 1,
    fill: '4299e1'
});

slide4.addText('Frontend Layer - Progressive Web App (PWA)', {
    x: 1, y: 1.7, w: 8, h: 0.6,
    fontSize: 16, bold: true, color: 'ffffff', align: 'center'
});

// Three portals
const portals = [
    { text: 'Public Portal\n🌟 Passengers', x: 1.5 },
    { text: 'Staff Portal\n🚌 Conductors', x: 4 },
    { text: 'Admin Portal\n👑 Administrators', x: 6.5 }
];

portals.forEach(portal => {
    slide4.addShape(pres.ShapeType.roundRect, {
        x: portal.x, y: 2.8, w: 2, h: 0.8,
        fill: '764ba2'
    });
    
    slide4.addText(portal.text, {
        x: portal.x, y: 2.9, w: 2, h: 0.6,
        fontSize: 12, bold: true, color: 'ffffff', align: 'center'
    });
});

// Backend layer
slide4.addShape(pres.ShapeType.roundRect, {
    x: 1, y: 4, w: 8, h: 1,
    fill: '667eea'
});

slide4.addText('Backend Layer - Node.js + Express + Socket.IO', {
    x: 1, y: 4.2, w: 8, h: 0.6,
    fontSize: 16, bold: true, color: 'ffffff', align: 'center'
});

// Database layer
slide4.addShape(pres.ShapeType.roundRect, {
    x: 1, y: 5.3, w: 8, h: 1,
    fill: '48bb78'
});

slide4.addText('Database Layer - MongoDB Atlas (Cloud)', {
    x: 1, y: 5.5, w: 8, h: 0.6,
    fontSize: 16, bold: true, color: 'ffffff', align: 'center'
});

// SLIDE 5: Key Features
let slide5 = pres.addSlide();
slide5.background = { color: 'f8fafc' };

slide5.addText('⭐ Key Features & Benefits', {
    x: 0.5, y: 0.5, w: 9, h: 0.8,
    fontSize: 32, bold: true, color: '2d3748', align: 'center'
});

const keyFeatures = [
    {
        icon: '📍', title: 'Real-time GPS Tracking',
        desc: '30-second location updates\nwith live bus positions',
        x: 1, y: 1.8, fill: '48bb78'
    },
    {
        icon: '🤖', title: 'AI-Powered Assistant',
        desc: 'Bilingual support (English/Hindi)\nIntelligent route suggestions',
        x: 5.2, y: 1.8, fill: '4299e1'
    },
    {
        icon: '📱', title: 'Progressive Web App',
        desc: 'Installable, works offline\nFast loading, responsive',
        x: 1, y: 3.8, fill: 'ed8936'
    },
    {
        icon: '🔄', title: 'Multi-Portal System',
        desc: 'Separate interfaces for\npassengers, staff, and admins',
        x: 5.2, y: 3.8, fill: 'f093fb'
    }
];

keyFeatures.forEach(feature => {
    slide5.addShape(pres.ShapeType.roundRect, {
        x: feature.x, y: feature.y, w: 3.6, h: 1.8,
        fill: feature.fill
    });
    
    slide5.addText(feature.icon, {
        x: feature.x + 0.1, y: feature.y + 0.1, w: 0.8, h: 0.6,
        fontSize: 24, color: 'ffffff', align: 'center'
    });
    
    slide5.addText(feature.title, {
        x: feature.x + 1, y: feature.y + 0.1, w: 2.5, h: 0.6,
        fontSize: 14, bold: true, color: 'ffffff'
    });
    
    slide5.addText(feature.desc, {
        x: feature.x + 0.1, y: feature.y + 0.8, w: 3.4, h: 0.9,
        fontSize: 12, color: 'ffffff'
    });
});

slide5.addText('💯 Benefits: Reduced waiting time • Better user experience • Improved efficiency • Data-driven insights', {
    x: 1, y: 6.2, w: 8, h: 0.6,
    fontSize: 14, color: '2d3748', align: 'center', italic: true
});

// SLIDE 6: Impact & Future
let slide6 = pres.addSlide();
slide6.background = { color: '667eea' };

slide6.addText('🚀 Impact & Future Vision', {
    x: 0.5, y: 0.5, w: 9, h: 0.8,
    fontSize: 32, bold: true, color: 'ffffff', align: 'center'
});

slide6.addText('Expected Impact:', {
    x: 1, y: 1.5, w: 8, h: 0.6,
    fontSize: 20, bold: true, color: 'ffffff'
});

const impacts = [
    '⏰ 40% reduction in passenger waiting time',
    '📱 90% improvement in user satisfaction', 
    '🎯 100% real-time location accuracy',
    '♻️ 25% increase in public transport usage'
];

impacts.forEach((impact, index) => {
    slide6.addText(`• ${impact}`, {
        x: 1.5, y: 2.2 + (index * 0.5), w: 7, h: 0.4,
        fontSize: 16, color: 'ffffff'
    });
});

slide6.addText('Future Enhancements:', {
    x: 1, y: 4.5, w: 8, h: 0.6,
    fontSize: 20, bold: true, color: 'ffffff'
});

const future = [
    '🔮 Predictive analytics for route optimization',
    '🎫 Integrated ticketing and payment system',
    '📊 Advanced analytics dashboard for operators',
    '🌐 Multi-city expansion capability'
];

future.forEach((item, index) => {
    slide6.addText(`• ${item}`, {
        x: 1.5, y: 5.2 + (index * 0.5), w: 7, h: 0.4,
        fontSize: 16, color: 'ffffff'
    });
});

slide6.addShape(pres.ShapeType.roundRect, {
    x: 2.5, y: 6.8, w: 5, h: 0.8,
    fill: 'f093fb'
});

slide6.addText('Thank You! Questions?', {
    x: 2.5, y: 6.9, w: 5, h: 0.6,
    fontSize: 18, bold: true, color: 'ffffff', align: 'center'
});

// Save to Downloads folder
const downloadsPath = 'C:\\Users\\ADMEN\\Downloads\\TrackWise_SIH2024_Presentation.pptx';

pres.writeFile({ fileName: downloadsPath })
    .then(() => {
        console.log('✅ SUCCESS! Professional TrackWise presentation created!');
        console.log(`📁 Saved to: ${downloadsPath}`);
        console.log('\n🎨 Presentation Features:');
        console.log('- 6 professional slides with diagrams');
        console.log('- Clean, modern design with TrackWise branding');
        console.log('- System architecture diagrams');
        console.log('- Feature showcases with icons');
        console.log('- Professional color scheme');
        console.log('- Corporate design - not AI-generated look');
        console.log('\n📋 Slides:');
        console.log('1. Title & Team Introduction');
        console.log('2. Problem Statement');
        console.log('3. TrackWise Solution Overview');
        console.log('4. System Architecture');
        console.log('5. Key Features & Benefits');
        console.log('6. Impact & Future Vision');
        console.log('\n🎯 Ready for SIH 2024 presentation!');
    })
    .catch(err => {
        console.error('❌ Error creating presentation:', err);
    });