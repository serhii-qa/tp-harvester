const { chromium } = require('playwright');

let browser, page, contex;
const launchOpt = {
    headless: true,
    slowMo: 0,
};

const syncAPI = ''; // sync api url

(async () => {
    browser = await chromium.launch(launchOpt);
    contex = await browser.newContext();
    page = await contex.newPage();

    page.on('request', (request) => {
        console.log('>>', request.method(), request.url());
    });
    page.on('response', (response) => {
        console.log('<<', response.status(), response.url());
        console.log('data:\n');
    });



    await page.goto(syncAPI);

    await contex.close();
    await browser.close();
})();