// Maintenance Mode Middleware - Shows fake security error page

const path = require('path');

// Set this to true to enable maintenance mode
const MAINTENANCE_MODE = true;

const maintenanceMode = (req, res, next) => {
    // Skip maintenance mode if disabled
    if (!MAINTENANCE_MODE) {
        return next();
    }

    // Allow access to the maintenance page itself
    if (req.path === '/maintenance-fake-error.html') {
        return next();
    }

    // Redirect ALL other requests to fake error page (no bypass)
    res.redirect('/maintenance-fake-error.html');
};

module.exports = maintenanceMode;
