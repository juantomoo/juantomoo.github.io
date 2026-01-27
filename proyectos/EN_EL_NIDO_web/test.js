const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({ type: msg.type(), text: msg.text() });
    });
    
    // Collect page errors
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push(error.message);
    });
    
    try {
        console.log('Loading page...');
        await page.goto('http://localhost:8888/index.html', { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait for boot sequence to appear
        await page.waitForSelector('#boot-sequence', { timeout: 5000 });
        console.log('✓ Boot sequence loaded');
        
        // Check if main elements exist
        const bootOverlay = await page.$('#boot-sequence');
        const enterBtn = await page.$('#enter-btn');
        
        if (bootOverlay && enterBtn) {
            console.log('✓ All required elements present');
        }
        
        // Wait a moment for any async errors
        await page.waitForTimeout(2000);
        
        // Report results
        console.log('\n=== Console Messages ===');
        if (consoleMessages.length === 0) {
            console.log('No console messages');
        } else {
            consoleMessages.forEach(msg => {
                console.log(`[${msg.type}] ${msg.text}`);
            });
        }
        
        console.log('\n=== Page Errors ===');
        if (pageErrors.length === 0) {
            console.log('No page errors detected');
        } else {
            pageErrors.forEach(err => {
                console.log(`ERROR: ${err}`);
            });
        }
        
        console.log('\n✓ Website loaded successfully!');
        
    } catch (error) {
        console.error('Error loading page:', error.message);
    }
    
    await browser.close();
})();
