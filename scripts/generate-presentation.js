const PptxGenJS = require('pptxgenjs');
const path = require('path');

// Create new presentation
let pres = new PptxGenJS();

// Set presentation properties
pres.author = 'Team Dynamite';
pres.company = 'TrackWise';
pres.subject = 'SIH 2024 - TrackWise Smart Transportation System';
pres.title = 'TrackWise - Smart Transportation System';

// Define colors and styles (with # prefix for proper color format)
const colors = {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    dark: '#2d3748',
    light: '#f8fafc',
    success: '#48bb78',
    warning: '#ed8936',
    info: '#4299e1'
};

// SLIDE 1: Title Slide
function createTitleSlide() {
    let slide = pres.addSlide();
    
    // Background gradient
    slide.background = { fill: { type: 'solid', color: colors.primary } };
    
    // Main title with icon
        slide.addText('🚌 TrackWise', {
        x: 1, y: 1.5, w: 8, h: 1,
        fontSize: 48, bold: true, color: 'ffffff', align: 'center',
        fontFace: 'Arial'
    });
    
    // Subtitle
    slide.addText('Smart Transportation System with AI Assistant', {
        x: 1, y: 2.8, w: 8, h: 0.8,
        fontSize: 24, color: 'ffffff', align: 'center',
        fontFace: 'Arial'
    });
    
    // SIH 2024 badge
    slide.addShape(pres.ShapeType.roundRect, {
        x: 3, y: 4, w: 4, h: 0.8,
        fill: { color: colors.accent },
        line: { color: 'ffffff', width: 2 }
    });
    
    slide.addText('SIH 2024 Submission', {
        x: 3, y: 4.1, w: 4, h: 0.6,
        fontSize: 18, bold: true, color: 'ffffff', align: 'center',
        fontFace: 'Arial'
    });
    
    // Team info
    slide.addText('Team Dynamite', {
        x: 1, y: 5.5, w: 8, h: 0.6,
        fontSize: 20, bold: true, color: 'ffffff', align: 'center',
        fontFace: 'Arial'
    });
    
    // Key features badges
    const features = ['Real-time GPS', 'AI Assistant', 'Multi-Portal', 'PWA Ready'];
    features.forEach((feature, index) => {
        slide.addShape(pres.ShapeType.roundRect, {
            x: 0.5 + (index * 2.25), y: 6.3, w: 2, h: 0.5,
            fill: { color: 'ffffff' },
            line: { color: colors.primary, width: 1 }
        });
        
        slide.addText(feature, {
            x: 0.5 + (index * 2.25), y: 6.35, w: 2, h: 0.4,
            fontSize: 12, color: colors.primary, align: 'center', bold: true,
            fontFace: 'Arial'
        });
    });
}

// SLIDE 2: Problem Statement
function createProblemSlide() {
    let slide = pres.addSlide();
    slide.background = { fill: { type: 'solid', color: colors.light } };
    
    // Title
    slide.addText('🎯 Problem Statement', {
        x: 0.5, y: 0.5, w: 9, h: 0.8,
        fontSize: 32, bold: true, color: colors.dark, align: 'center',
        fontFace: 'Arial'
    });
    
    // Problem description
    slide.addText('Current challenges in public transportation:', {
        x: 1, y: 1.5, w: 8, h: 0.6,
        fontSize: 18, color: colors.dark, align: 'left',
        fontFace: 'Arial'
    });
    
    // Problem points with icons
    const problems = [
        { icon: '❌', text: 'Lack of real-time bus location tracking' },
        { icon: '⏰', text: 'Uncertain arrival times causing passenger frustration' },
        { icon: '📱', text: 'No unified platform for all transportation needs' },
        { icon: '🤔', text: 'Difficulty in route planning and bus selection' },
        { icon: '📊', text: 'Poor system monitoring and analytics for operators' }
    ];
    
    problems.forEach((problem, index) => {
        // Problem icon box
        slide.addShape(pres.ShapeType.roundRect, {
            x: 1, y: 2.3 + (index * 0.8), w: 0.6, h: 0.6,
            fill: { color: colors.warning },
            line: { width: 0 }
        });
        
        slide.addText(problem.icon, {
            x: 1, y: 2.3 + (index * 0.8), w: 0.6, h: 0.6,
            fontSize: 20, color: 'ffffff', align: 'center',
            fontFace: 'Arial'
        });
        
        // Problem text
        slide.addText(problem.text, {
            x: 1.8, y: 2.4 + (index * 0.8), w: 7, h: 0.6,
            fontSize: 16, color: colors.dark, align: 'left',
            fontFace: 'Arial'
        });
    });
}

// SLIDE 3: TrackWise Solution
function createSolutionSlide() {
    let slide = pres.addSlide();
    slide.background = { fill: { type: 'solid', color: colors.light } };
    
    // Title
    slide.addText('💡 TrackWise Solution', {
        x: 0.5, y: 0.5, w: 9, h: 0.8,
        fontSize: 32, bold: true, color: colors.dark, align: 'center',
        fontFace: 'Arial'
    });
    
    // Central TrackWise logo/box
    slide.addShape(pres.ShapeType.roundRect, {
        x: 3.5, y: 2, w: 3, h: 1.5,
        fill: { color: colors.primary },
        line: { color: colors.secondary, width: 3 }
    });
    
    slide.addText('🚌\nTrackWise', {
        x: 3.5, y: 2.1, w: 3, h: 1.3,
        fontSize: 20, bold: true, color: 'ffffff', align: 'center',
        fontFace: 'Arial'
    });
    
    // Solution components around the center
    const solutions = [
        { x: 1, y: 1, text: '📱 PWA App\nInstant Access', color: colors.info },
        { x: 7, y: 1, text: '🤖 AI Assistant\nSmart Guidance', color: colors.success },
        { x: 1, y: 4, text: '📍 Real-time GPS\n30-sec Updates', color: colors.warning },
        { x: 7, y: 4, text: '🎯 Multi-Portal\nAll User Types', color: colors.accent }
    ];
    
    solutions.forEach(solution => {
        // Solution box
        slide.addShape(pres.ShapeType.roundRect, {
            x: solution.x, y: solution.y, w: 2.2, h: 1.2,
            fill: { color: solution.color },
            line: { width: 0 }
        });
        
        slide.addText(solution.text, {
            x: solution.x, y: solution.y + 0.1, w: 2.2, h: 1,
            fontSize: 14, bold: true, color: 'ffffff', align: 'center',
            fontFace: 'Arial'
        });
        
        // Connecting lines to center
        slide.addShape(pres.ShapeType.line, {
            x: solution.x + 1.1, y: solution.y + 0.6,
            w: 3.5 - (solution.x + 1.1), h: 2.75 - (solution.y + 0.6),
            line: { color: colors.secondary, width: 2, dashType: 'dash' }
        });
    });
}

// SLIDE 4: System Architecture
function createArchitectureSlide() {
    let slide = pres.addSlide();
    slide.background = { fill: { type: 'solid', color: colors.light } };
    
    // Title
    slide.addText('🏗️ System Architecture', {
        x: 0.5, y: 0.5, w: 9, h: 0.8,
        fontSize: 32, bold: true, color: colors.dark, align: 'center',
        fontFace: 'Arial'
    });
    
    // Frontend layer
    slide.addShape(pres.ShapeType.roundRect, {
        x: 1, y: 1.5, w: 8, h: 1,
        fill: { color: colors.info },
        line: { width: 0 }
    });
    
    slide.addText('Frontend Layer - Progressive Web App (PWA)', {
        x: 1, y: 1.7, w: 8, h: 0.6,
        fontSize: 16, bold: true, color: 'ffffff', align: 'center',
        fontFace: 'Arial'
    });
    
    // Three portals
    const portals = [
        { text: 'Public Portal\n🌟 Passengers', x: 1.5 },
        { text: 'Staff Portal\n🚌 Conductors', x: 4 },
        { text: 'Admin Portal\n👑 Administrators', x: 6.5 }
    ];
    
    portals.forEach(portal => {
        slide.addShape(pres.ShapeType.roundRect, {
            x: portal.x, y: 2.8, w: 2, h: 0.8,
            fill: { color: colors.secondary },
            line: { width: 0 }
        });
        
        slide.addText(portal.text, {
            x: portal.x, y: 2.9, w: 2, h: 0.6,
            fontSize: 12, bold: true, color: 'ffffff', align: 'center',
            fontFace: 'Arial'
        });
    });
    
    // Backend layer
    slide.addShape(pres.ShapeType.roundRect, {
        x: 1, y: 4, w: 8, h: 1,
        fill: { color: colors.primary },
        line: { width: 0 }
    });
    
    slide.addText('Backend Layer - Node.js + Express + Socket.IO', {
        x: 1, y: 4.2, w: 8, h: 0.6,
        fontSize: 16, bold: true, color: 'ffffff', align: 'center',
        fontFace: 'Arial'
    });
    
    // Database layer
    slide.addShape(pres.ShapeType.roundRect, {
        x: 1, y: 5.3, w: 8, h: 1,
        fill: { color: colors.success },
        line: { width: 0 }
    });
    
    slide.addText('Database Layer - MongoDB Atlas (Cloud)', {
        x: 1, y: 5.5, w: 8, h: 0.6,
        fontSize: 16, bold: true, color: 'ffffff', align: 'center',
        fontFace: 'Arial'
    });
    
    // Connecting arrows
    for (let i = 0; i < 2; i++) {
        slide.addShape(pres.ShapeType.line, {
            x: 5, y: 2.5 + (i * 1.3), w: 0, h: 1,
            line: { color: colors.dark, width: 3, endArrowType: 'triangle' }
        });
    }
}

// SLIDE 5: Key Features
function createFeaturesSlide() {
    let slide = pres.addSlide();
    slide.background = { fill: { type: 'solid', color: colors.light } };
    
    // Title
    slide.addText('⭐ Key Features & Benefits', {
        x: 0.5, y: 0.5, w: 9, h: 0.8,
        fontSize: 32, bold: true, color: colors.dark, align: 'center',
        fontFace: 'Arial'
    });
    
    // Features grid
    const features = [
        {
            icon: '📍', title: 'Real-time GPS Tracking',
            desc: '30-second location updates\nwith live bus positions',
            x: 1, y: 1.8, color: colors.success
        },
        {
            icon: '🤖', title: 'AI-Powered Assistant',
            desc: 'Bilingual support (English/Hindi)\nIntelligent route suggestions',
            x: 5.2, y: 1.8, color: colors.info
        },
        {
            icon: '📱', title: 'Progressive Web App',
            desc: 'Installable, works offline\nFast loading, responsive',
            x: 1, y: 3.8, color: colors.warning
        },
        {
            icon: '🔄', title: 'Multi-Portal System',
            desc: 'Separate interfaces for\npassengers, staff, and admins',
            x: 5.2, y: 3.8, color: colors.accent
        }
    ];
    
    features.forEach(feature => {
        // Feature box
        slide.addShape(pres.ShapeType.roundRect, {
            x: feature.x, y: feature.y, w: 3.6, h: 1.8,
            fill: { color: feature.color },
            line: { width: 0 }
        });
        
        // Feature icon
        slide.addText(feature.icon, {
            x: feature.x + 0.1, y: feature.y + 0.1, w: 0.8, h: 0.6,
            fontSize: 24, color: 'ffffff', align: 'center',
            fontFace: 'Arial'
        });
        
        // Feature title
        slide.addText(feature.title, {
            x: feature.x + 1, y: feature.y + 0.1, w: 2.5, h: 0.6,
            fontSize: 14, bold: true, color: 'ffffff', align: 'left',
            fontFace: 'Arial'
        });
        
        // Feature description
        slide.addText(feature.desc, {
            x: feature.x + 0.1, y: feature.y + 0.8, w: 3.4, h: 0.9,
            fontSize: 12, color: 'ffffff', align: 'left',
            fontFace: 'Arial'
        });
    });
    
    // Bottom benefits
    slide.addText('💯 Benefits: Reduced waiting time • Better user experience • Improved efficiency • Data-driven insights', {
        x: 1, y: 6.2, w: 8, h: 0.6,
        fontSize: 14, color: colors.dark, align: 'center', italic: true,
        fontFace: 'Arial'
    });
}

// SLIDE 6: Impact & Future
function createImpactSlide() {
    let slide = pres.addSlide();
    slide.background = { fill: { type: 'solid', color: colors.primary } };
    
    // Title
    slide.addText('🚀 Impact & Future Vision', {
        x: 0.5, y: 0.5, w: 9, h: 0.8,
        fontSize: 32, bold: true, color: 'ffffff', align: 'center',
        fontFace: 'Arial'
    });
    
    // Impact metrics
    slide.addText('Expected Impact:', {
        x: 1, y: 1.5, w: 8, h: 0.6,
        fontSize: 20, bold: true, color: 'ffffff', align: 'left',
        fontFace: 'Arial'
    });
    
    const impacts = [
        '⏰ 40% reduction in passenger waiting time',
        '📱 90% improvement in user satisfaction',
        '🎯 100% real-time location accuracy',
        '♻️ 25% increase in public transport usage'
    ];
    
    impacts.forEach((impact, index) => {
        slide.addText(`• ${impact}`, {
            x: 1.5, y: 2.2 + (index * 0.5), w: 7, h: 0.4,
            fontSize: 16, color: 'ffffff', align: 'left',
            fontFace: 'Arial'
        });
    });
    
    // Future roadmap
    slide.addText('Future Enhancements:', {
        x: 1, y: 4.5, w: 8, h: 0.6,
        fontSize: 20, bold: true, color: 'ffffff', align: 'left',
        fontFace: 'Arial'
    });
    
    const future = [
        '🔮 Predictive analytics for route optimization',
        '🎫 Integrated ticketing and payment system',
        '📊 Advanced analytics dashboard for operators',
        '🌐 Multi-city expansion capability'
    ];
    
    future.forEach((item, index) => {
        slide.addText(`• ${item}`, {
            x: 1.5, y: 5.2 + (index * 0.5), w: 7, h: 0.4,
            fontSize: 16, color: 'ffffff', align: 'left',
            fontFace: 'Arial'
        });
    });
    
    // Thank you
    slide.addShape(pres.ShapeType.roundRect, {
        x: 2.5, y: 6.8, w: 5, h: 0.8,
        fill: { color: colors.accent },
        line: { width: 0 }
    });
    
    slide.addText('Thank You! Questions?', {
        x: 2.5, y: 6.9, w: 5, h: 0.6,
        fontSize: 18, bold: true, color: 'ffffff', align: 'center',
        fontFace: 'Arial'
    });
}

// Generate all slides
createTitleSlide();
createProblemSlide();
createSolutionSlide();
createArchitectureSlide();
createFeaturesSlide();
createImpactSlide();

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
        console.log('- No AI-generated look - clean and corporate');
        console.log('\n📋 Slides:');
        console.log('1. Title & Team Introduction');
        console.log('2. Problem Statement');
        console.log('3. TrackWise Solution Overview');
        console.log('4. System Architecture');
        console.log('5. Key Features & Benefits');
        console.log('6. Impact & Future Vision');
    })
    .catch(err => {
        console.error('❌ Error creating presentation:', err);
    });

console.log('🔄 Generating professional TrackWise presentation...');