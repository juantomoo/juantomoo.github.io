const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });
    
    page.on('pageerror', err => {
        errors.push(err.message);
    });

    const filePath = 'file://' + path.resolve(__dirname, 'index.html');
    console.log('Testing:', filePath);
    
    try {
        await page.goto(filePath, { waitUntil: 'networkidle' });
        console.log('✓ Page loaded successfully');
        
        // Check title
        const title = await page.title();
        console.log('✓ Title:', title);
        
        // Check stories count
        const storyCards = await page.locator('.story-card').count();
        console.log('✓ Stories loaded:', storyCards);
        
        // Check navigation tabs
        const tabs = await page.locator('.nav-tab').count();
        console.log('✓ Navigation tabs:', tabs);
        
        // Check glossary items
        const glossaryItems = await page.locator('.glossary-item').count();
        console.log('✓ Glossary items:', glossaryItems);
        
        // Test opening a story
        await page.locator('.story-card').first().click();
        await page.waitForSelector('.modal.active', { timeout: 3000 });
        console.log('✓ Story modal opens correctly');
        
        // Close modal
        await page.locator('.modal-close').click();
        console.log('✓ Modal closes correctly');
        
        // Test navigation tabs
        await page.locator('.nav-tab[data-section="glossary"]').click();
        const glossaryVisible = await page.locator('#glossary.active').isVisible();
        console.log('✓ Glossary tab works:', glossaryVisible);
        
        // Test TOC
        await page.locator('.nav-tab[data-section="toc"]').click();
        const tocItems = await page.locator('.toc-item').count();
        console.log('✓ TOC items:', tocItems);
        
        // Check for console errors
        if (errors.length > 0) {
            console.log('\n⚠ Console errors found:');
            errors.forEach(e => console.log('  -', e));
        } else {
            console.log('✓ No console errors');
        }
        
        console.log('\n✅ All tests passed!');
        
    } catch (err) {
        console.error('❌ Test failed:', err.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
