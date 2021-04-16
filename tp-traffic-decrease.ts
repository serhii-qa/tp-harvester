const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch( {
        headless: false,
        slowMo: 1000,
    } );
    const page = await browser.newPage();
    await page.setViewportSize( {
        width: 1200,
        height: 1200
    } );

    // page.on( "request", request => console.log( request.method(), request.url() ) );
    page.on( "response", response => console.log( response.status(), response.url() ));

    await page.route('**/*', route => {
        return route.request().resourceType() !== 'document' ? route.abort() : route.continue()
    })

    await page.goto(''); // env url
    await browser.close();
})();