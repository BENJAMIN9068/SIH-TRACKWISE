// Clear fake content cache immediately on page load
(function() {
    console.log('🧹 Clearing old cache and loading enhanced TrackWise...');
    
    // Clear service worker cache for old versions
    if ('serviceWorker' in navigator && 'caches' in window) {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                if (cacheName.includes('bus-tracking-v1') || cacheName.includes('bus-tracking-v2') || 
                    cacheName.includes('fake') || cacheName.includes('breach')) {
                    console.log('🗑️ Deleting old cache:', cacheName);
                    caches.delete(cacheName);
                }
            });
        });
        
        // Also try to trigger service worker update
        navigator.serviceWorker.ready.then(registration => {
            registration.update();
        });
    }
    
    // Clear localStorage items related to fake content
    if (typeof localStorage !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('fake') || key.includes('breach') || key.includes('maintenance'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => {
            console.log('🗑️ Removing localStorage item:', key);
            localStorage.removeItem(key);
        });
    }
    
    // Clear sessionStorage items related to fake content  
    if (typeof sessionStorage !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.includes('fake') || key.includes('breach') || key.includes('maintenance'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => {
            console.log('🗑️ Removing sessionStorage item:', key);
            sessionStorage.removeItem(key);
        });
    }
    
    // If user is accessing old fake URLs, redirect them
    const currentPath = window.location.pathname;
    if (currentPath.includes('trackwise.html') || currentPath.includes('maintenance') || currentPath.includes('breach')) {
        console.log('🔄 Redirecting from fake content URL to homepage');
        window.location.replace('/');
    }
    
    console.log('✅ Cache clearing completed');
})();