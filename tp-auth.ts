const { chromium } = require('playwright');

const loginData = {
    login: '', //
    password: '', //
};

(async () => {

    const browser = await chromium.launch({headless: true, });
    const context = await browser.newContext();

    const page = await context.newPage();
    await page.goto(''); // base url
    await page.click(`#dropdownAccaunt`);
    await page.click('//a[contains(text(),\'Увійти в акаунт\')]');
    await page.fill('#username', loginData.login);
    await page.fill('#password', loginData.password);
    await page.click('//button[contains(text(),\'Увійти\')]');

    await page.waitForTimeout(1000);

    console.log(await page.url())
    console.log(await page.title())

    await page.screenshot({path: `./`}); // err
    await context.close();
    await browser.close();
})();