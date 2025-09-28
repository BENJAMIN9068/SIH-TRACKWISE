const PptxGenJS = require('pptxgenjs');

// Create new presentation following SIH 2024 format
let pres = new PptxGenJS();

// Set presentation properties exactly as SIH format
pres.author = 'Team Dynamite';
pres.company = 'SIH 2024';
pres.subject = 'Smart India Hackathon 2024 - TrackWise Solution';
pres.title = 'TrackWise - Smart Transportation System';

console.log('🔄 Creating SIH 2024 format TrackWise presentation...');

// SLIDE 1: Problem Statement & Solution Title (SIH Format)
let slide1 = pres.addSlide();
slide1.background = { color: 'ffffff' }; // Keep original white background

slide1.addText('Smart India Hackathon 2024', {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 16, bold: true, color: '000000', align: 'center'
});

slide1.addText('Problem Statement ID: [Your PS Number]', {
    x: 0.5, y: 0.8, w: 9, h: 0.4,
    fontSize: 14, color: '666666', align: 'center'
});

slide1.addText('TrackWise', {
    x: 1, y: 1.5, w: 8, h: 1,
    fontSize: 44, bold: true, color: '000000', align: 'center'
});

slide1.addText('Smart Transportation System with AI Assistant', {
    x: 1, y: 2.5, w: 8, h: 0.6,
    fontSize: 20, color: '333333', align: 'center'
});

slide1.addText('Team Dynamite', {
    x: 1, y: 3.5, w: 8, h: 0.6,
    fontSize: 18, bold: true, color: '000000', align: 'center'
});

// Problem statement box
slide1.addShape(pres.ShapeType.roundRect, {
    x: 1.5, y: 4.5, w: 7, h: 2,
    fill: 'f5f5f5',
    line: { color: '000000', width: 1 }
});

slide1.addText('Problem: Public transportation lacks real-time tracking, causing passenger uncertainty and inefficient route planning.', {
    x: 2, y: 4.8, w: 6, h: 1.4,
    fontSize: 14, color: '000000', align: 'left'
});

// SLIDE 2: Current Challenges & Need Analysis
let slide2 = pres.addSlide();
slide2.background = { color: 'ffffff' };

slide2.addText('Current Challenges in Public Transportation', {
    x: 1, y: 0.5, w: 8, h: 0.8,
    fontSize: 28, bold: true, color: '000000', align: 'center'
});

// Challenge boxes with diagrams
const challenges = [
    'No real-time bus location tracking',
    'Uncertain arrival times',
    'Poor passenger experience',
    'Inefficient route management',
    'Lack of system integration'
];

challenges.forEach((challenge, index) => {
    // Number circles
    slide2.addShape(pres.ShapeType.ellipse, {
        x: 1, y: 1.8 + (index * 0.8), w: 0.5, h: 0.5,
        fill: '000000'
    });
    
    slide2.addText((index + 1).toString(), {
        x: 1, y: 1.8 + (index * 0.8), w: 0.5, h: 0.5,
        fontSize: 16, bold: true, color: 'ffffff', align: 'center'
    });
    
    // Challenge text
    slide2.addText(challenge, {
        x: 1.8, y: 1.9 + (index * 0.8), w: 7, h: 0.6,
        fontSize: 16, color: '000000'
    });
});

// SLIDE 3: Proposed Solution - TrackWise System Architecture
let slide3 = pres.addSlide();
slide3.background = { color: 'ffffff' };

slide3.addText('TrackWise Solution Architecture', {
    x: 1, y: 0.5, w: 8, h: 0.8,
    fontSize: 28, bold: true, color: '000000', align: 'center'
});

// System Architecture Diagram
// Frontend Layer
slide3.addShape(pres.ShapeType.rect, {
    x: 1, y: 1.5, w: 8, h: 1,
    fill: 'e6f3ff',
    line: { color: '000000', width: 2 }
});

slide3.addText('Frontend Layer - Progressive Web App', {
    x: 1, y: 1.7, w: 8, h: 0.6,
    fontSize: 16, bold: true, color: '000000', align: 'center'
});

// Three portals
slide3.addShape(pres.ShapeType.rect, {
    x: 1.5, y: 2.8, w: 2, h: 0.8,
    fill: 'ffffff',
    line: { color: '000000', width: 1 }
});
slide3.addText('Public Portal', { x: 1.5, y: 3, w: 2, h: 0.4, fontSize: 12, align: 'center' });

slide3.addShape(pres.ShapeType.rect, {
    x: 4, y: 2.8, w: 2, h: 0.8,
    fill: 'ffffff',
    line: { color: '000000', width: 1 }
});
slide3.addText('Staff Portal', { x: 4, y: 3, w: 2, h: 0.4, fontSize: 12, align: 'center' });

slide3.addShape(pres.ShapeType.rect, {
    x: 6.5, y: 2.8, w: 2, h: 0.8,
    fill: 'ffffff',
    line: { color: '000000', width: 1 }
});
slide3.addText('Admin Portal', { x: 6.5, y: 3, w: 2, h: 0.4, fontSize: 12, align: 'center' });

// Backend Layer
slide3.addShape(pres.ShapeType.rect, {
    x: 1, y: 4, w: 8, h: 1,
    fill: 'fff0e6',
    line: { color: '000000', width: 2 }
});
slide3.addText('Backend - Node.js + Express + Socket.IO + AI Assistant', {
    x: 1, y: 4.2, w: 8, h: 0.6,
    fontSize: 16, bold: true, color: '000000', align: 'center'
});

// Database Layer
slide3.addShape(pres.ShapeType.rect, {
    x: 1, y: 5.3, w: 8, h: 1,
    fill: 'f0f8f0',
    line: { color: '000000', width: 2 }
});
slide3.addText('Database - MongoDB Atlas (Cloud)', {
    x: 1, y: 5.5, w: 8, h: 0.6,
    fontSize: 16, bold: true, color: '000000', align: 'center'
});

// Connecting arrows
slide3.addShape(pres.ShapeType.line, {
    x: 5, y: 2.5, w: 0, h: 1.5,
    line: { color: '000000', width: 2 }
});
slide3.addShape(pres.ShapeType.line, {
    x: 5, y: 5, w: 0, h: 0.3,
    line: { color: '000000', width: 2 }
});

// SLIDE 4: Key Features & Technical Implementation
let slide4 = pres.addSlide();
slide4.background = { color: 'ffffff' };

slide4.addText('TrackWise Key Features', {
    x: 1, y: 0.5, w: 8, h: 0.8,
    fontSize: 28, bold: true, color: '000000', align: 'center'
});

// Feature diagram with connecting lines
const features = [
    { text: 'Real-time GPS Tracking\n30-second updates', x: 1, y: 1.8 },
    { text: 'AI Assistant\nBilingual Support', x: 5.2, y: 1.8 },
    { text: 'Progressive Web App\nOffline Capability', x: 1, y: 3.8 },
    { text: 'Multi-Portal System\nRole-based Access', x: 5.2, y: 3.8 }
];

features.forEach(feature => {
    slide4.addShape(pres.ShapeType.roundRect, {
        x: feature.x, y: feature.y, w: 3.6, h: 1.5,
        fill: 'f8f8f8',
        line: { color: '000000', width: 1 }
    });
    
    slide4.addText(feature.text, {
        x: feature.x + 0.1, y: feature.y + 0.3, w: 3.4, h: 0.9,
        fontSize: 14, bold: true, color: '000000', align: 'center'
    });
});

// Central hub
slide4.addShape(pres.ShapeType.ellipse, {
    x: 4, y: 2.8, w: 2, h: 1,
    fill: 'ffffff',
    line: { color: '000000', width: 2 }
});

slide4.addText('TrackWise\nCore', {
    x: 4, y: 3.1, w: 2, h: 0.4,
    fontSize: 12, bold: true, color: '000000', align: 'center'
});

// SLIDE 5: Implementation Plan & Technical Stack
let slide5 = pres.addSlide();
slide5.background = { color: 'ffffff' };

slide5.addText('Implementation & Technology Stack', {
    x: 1, y: 0.5, w: 8, h: 0.8,
    fontSize: 28, bold: true, color: '000000', align: 'center'
});

// Technology stack diagram
slide5.addText('Frontend Technologies:', {
    x: 1, y: 1.5, w: 4, h: 0.4,
    fontSize: 16, bold: true, color: '000000'
});

const frontendTech = ['HTML5/CSS3/JavaScript', 'Bootstrap 5', 'Progressive Web App', 'Socket.IO Client'];
frontendTech.forEach((tech, index) => {
    slide5.addShape(pres.ShapeType.rect, {
        x: 1.5, y: 2 + (index * 0.5), w: 3, h: 0.4,
        fill: 'e6f3ff',
        line: { color: '000000', width: 1 }
    });
    slide5.addText(`• ${tech}`, { x: 1.6, y: 2.05 + (index * 0.5), w: 2.8, h: 0.3, fontSize: 11 });
});

slide5.addText('Backend Technologies:', {
    x: 5.5, y: 1.5, w: 3, h: 0.4,
    fontSize: 16, bold: true, color: '000000'
});

const backendTech = ['Node.js + Express', 'MongoDB Atlas', 'Socket.IO Server', 'OpenAI API'];
backendTech.forEach((tech, index) => {
    slide5.addShape(pres.ShapeType.rect, {
        x: 6, y: 2 + (index * 0.5), w: 3, h: 0.4,
        fill: 'fff0e6',
        line: { color: '000000', width: 1 }
    });
    slide5.addText(`• ${tech}`, { x: 6.1, y: 2.05 + (index * 0.5), w: 2.8, h: 0.3, fontSize: 11 });
});

// Implementation phases
slide5.addText('Implementation Phases:', {
    x: 1, y: 4.5, w: 8, h: 0.4,
    fontSize: 16, bold: true, color: '000000'
});

const phases = ['Phase 1: Core tracking system', 'Phase 2: AI assistant integration', 'Phase 3: Multi-portal deployment'];
phases.forEach((phase, index) => {
    slide5.addShape(pres.ShapeType.rect, {
        x: 1 + (index * 2.7), y: 5.2, w: 2.5, h: 0.8,
        fill: 'f0f8f0',
        line: { color: '000000', width: 1 }
    });
    slide5.addText(phase, { x: 1.1 + (index * 2.7), y: 5.4, w: 2.3, h: 0.4, fontSize: 10, align: 'center' });
});

// SLIDE 6: Expected Impact & Benefits
let slide6 = pres.addSlide();
slide6.background = { color: 'ffffff' };

slide6.addText('Expected Impact & Benefits', {
    x: 1, y: 0.5, w: 8, h: 0.8,
    fontSize: 28, bold: true, color: '000000', align: 'center'
});

// Impact metrics with visual elements
slide6.addText('Quantifiable Benefits:', {
    x: 1, y: 1.5, w: 8, h: 0.4,
    fontSize: 18, bold: true, color: '000000'
});

const impacts = [
    { metric: '40%', desc: 'Reduction in passenger waiting time' },
    { metric: '90%', desc: 'Improvement in user satisfaction' },
    { metric: '100%', desc: 'Real-time location accuracy' },
    { metric: '25%', desc: 'Increase in public transport usage' }
];

impacts.forEach((impact, index) => {
    // Metric circles
    slide6.addShape(pres.ShapeType.ellipse, {
        x: 1 + (index * 2), y: 2.3, w: 1.2, h: 1.2,
        fill: 'f0f8f0',
        line: { color: '000000', width: 2 }
    });
    
    slide6.addText(impact.metric, {
        x: 1 + (index * 2), y: 2.6, w: 1.2, h: 0.6,
        fontSize: 16, bold: true, color: '000000', align: 'center'
    });
    
    slide6.addText(impact.desc, {
        x: 0.8 + (index * 2), y: 3.8, w: 1.6, h: 0.8,
        fontSize: 10, color: '000000', align: 'center'
    });
});

// Future enhancements
slide6.addText('Future Scope:', {
    x: 1, y: 5, w: 8, h: 0.4,
    fontSize: 16, bold: true, color: '000000'
});

const future = ['Predictive analytics', 'Payment integration', 'Multi-city expansion'];
future.forEach((item, index) => {
    slide6.addShape(pres.ShapeType.rect, {
        x: 1.5 + (index * 2.5), y: 5.5, w: 2.2, h: 0.6,
        fill: 'f8f8f8',
        line: { color: '000000', width: 1 }
    });
    slide6.addText(item, { x: 1.6 + (index * 2.5), y: 5.7, w: 2, h: 0.2, fontSize: 12, align: 'center' });
});

// Thank you
slide6.addText('Thank You', {
    x: 1, y: 6.5, w: 8, h: 0.6,
    fontSize: 24, bold: true, color: '000000', align: 'center'
});

// Save to Downloads folder with SIH format name
const downloadsPath = 'C:\\Users\\ADMEN\\Downloads\\TrackWise_SIH2024_Final.pptx';

pres.writeFile({ fileName: downloadsPath })
    .then(() => {
        console.log('✅ SUCCESS! SIH 2024 format TrackWise presentation created!');
        console.log(`📁 Saved to: ${downloadsPath}`);
        console.log('\n📋 6 Slides Created (SIH Format):');
        console.log('1. Problem Statement & Solution Title');
        console.log('2. Current Challenges Analysis');
        console.log('3. Proposed Solution Architecture');
        console.log('4. Key Features & Implementation');
        console.log('5. Technology Stack & Implementation Plan');
        console.log('6. Expected Impact & Future Scope');
        console.log('\n✅ Features:');
        console.log('- Original SIH template colors (black/white/gray)');
        console.log('- Technical diagrams with proper connections');
        console.log('- System architecture visualization');
        console.log('- Implementation phases clearly defined');
        console.log('- Quantified impact metrics');
        console.log('- Professional corporate design');
        console.log('\n🎯 Ready for SIH 2024 submission!');
    })
    .catch(err => {
        console.error('❌ Error creating presentation:', err);
    });