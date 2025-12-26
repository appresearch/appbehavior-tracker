const puppeteer = require('puppeteer');

class Tracker {
    constructor() {
        this.trackingScripts = [];
        this.networkRequests = [];
    }

    async analyze(url) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        page.on('request', request => {
            this.networkRequests.push({
                url: request.url(),
                method: request.method(),
            });
        });

        await page.goto(url);
        
        const scripts = await page.evaluate(() => {
            return Array.from(document.scripts).map(s => s.src || s.textContent);
        });

        await browser.close();

        return {
            trackingScripts: this._identifyTracking(scripts),
            networkRequests: this.networkRequests,
        };
    }

    _identifyTracking(scripts) {
        const trackingKeywords = ['analytics', 'tracking', 'pixel', 'beacon'];
        return scripts.filter(s => 
            trackingKeywords.some(keyword => s.toLowerCase().includes(keyword))
        );
    }
}

module.exports = { Tracker };



