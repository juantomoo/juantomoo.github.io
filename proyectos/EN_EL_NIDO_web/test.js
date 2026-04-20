const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Registro centralizado de errores para detectar regresiones silenciosas.
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
        if (storyCards !== 30) {
            throw new Error(`Expected 30 stories, received ${storyCards}`);
        }

        // Check navigation tabs
        const tabs = await page.locator('.nav-tab').count();
        console.log('✓ Navigation tabs:', tabs);

        // Check glossary items
        const glossaryItems = await page.locator('.glossary-item').count();
        console.log('✓ Glossary items:', glossaryItems);
        if (glossaryItems < 45) {
            throw new Error(`Expected at least 45 glossary items, received ${glossaryItems}`);
        }

        // Test opening a story
        await page.locator('.story-card').first().click();
        await page.waitForSelector('.modal.active', { timeout: 3000 });
        console.log('✓ Story modal opens correctly');

        // Test contextual glossary modal from inline term
        const inlineTerm = page.locator('#modalBody .inline-term').first();
        await inlineTerm.click();
        await page.waitForSelector('#glossaryTermModal.active', { timeout: 3000 });

        const storyStillOpen = await page.locator('#storyModal.active').isVisible();
        if (!storyStillOpen) {
            throw new Error('Story modal should remain open while glossary modal is displayed');
        }

        const glossaryModalTitle = await page.locator('#glossaryModalBody .glossary-modal-title').textContent();
        if (!glossaryModalTitle || !glossaryModalTitle.trim()) {
            throw new Error('Contextual glossary modal did not render term details');
        }

        await page.locator('#glossaryModalClose').click();
        await page.waitForFunction(() => {
            const modal = document.getElementById('glossaryTermModal');
            return modal && !modal.classList.contains('active');
        }, { timeout: 3000 });
        console.log('✓ Contextual glossary modal works');

        // Close modal
        await page.locator('#modalClose').click();
        console.log('✓ Modal closes correctly');

        // Test navigation tabs
        await page.locator('.nav-tab[data-section="glossary"]').click();
        const glossaryVisible = await page.locator('#glossary.active').isVisible();
        console.log('✓ Glossary tab works:', glossaryVisible);

        // Test TOC
        await page.locator('.nav-tab[data-section="toc"]').click();
        const tocItems = await page.locator('.toc-item').count();
        console.log('✓ TOC items:', tocItems);
        if (tocItems !== storyCards) {
            throw new Error(`TOC items (${tocItems}) should match story cards (${storyCards})`);
        }

        // Test deep-link story opening
        await page.goto(`${filePath}#story-3`, { waitUntil: 'networkidle' });
        await page.waitForSelector('.modal.active', { timeout: 3000 });
        const deepLinkDate = await page.locator('#modalDate').textContent();
        console.log('✓ Deep-link opens story:', deepLinkDate?.trim());

        // Test persisted font size + last story restoration
        await page.locator('.font-btn').nth(1).click();
        const persistedFont = await page.evaluate(() => localStorage.getItem('en_el_nido_font_size'));
        if (!persistedFont) {
            throw new Error('Font size was not persisted in localStorage');
        }
        await page.locator('#modalClose').click();

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForSelector('.modal.active', { timeout: 3000 });

        const persistedLastStory = await page.evaluate(() => localStorage.getItem('en_el_nido_last_story_id'));
        if (!persistedLastStory) {
            throw new Error('Last story id was not persisted in localStorage');
        }

        const modalFontSize = await page.locator('#modalBody').evaluate((el) => {
            return window.getComputedStyle(el).fontSize;
        });
        if (Number.parseInt(modalFontSize, 10) !== Number.parseInt(persistedFont, 10)) {
            throw new Error(`Persisted font mismatch. storage=${persistedFont}, modal=${modalFontSize}`);
        }
        console.log('✓ Persistence works for font size and last story');

        // Test robust glossary search (without accents)
        await page.locator('#modalClose').click();
        await page.locator('.nav-tab[data-section="glossary"]').click();
        await page.fill('#glossarySearch', 'senal');

        const visibleTerms = await page.locator('.glossary-item:not(.hidden) .term-name').allTextContents();
        const hasSenalTerm = visibleTerms
            .map((term) => term.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
            .some((normalizedTerm) => normalizedTerm.includes('senal'));

        if (!hasSenalTerm) {
            throw new Error('Glossary robust search failed for query "senal"');
        }
        console.log('✓ Robust glossary search works without accents');

        // Check for console errors
        if (errors.length > 0) {
            console.log('\n⚠ Console errors found:');
            errors.forEach(e => console.log('  -', e));
            throw new Error('Console errors detected during tests');
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
