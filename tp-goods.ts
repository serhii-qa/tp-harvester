const { chromium } = require('playwright');

let browser, page, context;
const launchOpt = {
    headless: true,
    slowMo: 0,
};

const goodsResultData = {};
const menuLinks = [];
const baseURL = ''; // env clear  // await page.waitForLoadState('load'); 'domcontentloaded'

const contentParsing = async infoContainer => {
//
    for (let key in infoContainer) {
        //console.log(await infoContainer[key].$eval('a', el => el.innerText) );
        //console.log(await infoContainer[key].$eval('a', el => el.getAttribute('href')) );

        goodsResultData[await infoContainer[key].$eval('a', el => el.innerText)] = await infoContainer[key]
            .$eval('a', el => el.getAttribute('href'))
    }

}

//     /// todo need to rebuild
//
//     console.log( collector.getAttribute('.title.hidden-sm.hidden-md.hidden-lg') )
//
//     // collector('.title.hidden-sm.hidden-md.hidden-lg').each( (iter, el) => {
//     //     // console.log(`adding >>>` ,  $(el).text() );
//     //     goodsResultData[collector(el).text()] =  collector(`.title.hidden-sm.hidden-md.hidden-lg > a`).attr('href');
//     // })
// }

(async () => {
    console.time('run');
    browser = await chromium.launch( launchOpt );
    context = await browser.newContext();
    page = await context.newPage();

    // requests-decrease
    await page.route('**/*', route => {
        return route.request().resourceType() !== 'document' ? route.abort() : route.continue()
    });

    // watching for response status
    page.on('response',  response => {
        if ( response.status() !== 200 ) {
            console.log( `${response.status()} ` );
        }
    });

    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');

    const menuDOMList = await page.$$('#collapseCatalogMenu li :not(:has(ul)) > a');
    for (const key in menuDOMList) {
        menuLinks.push( await menuDOMList[key].getAttribute('href') );
    }

    console.log(`Total main menu links: ${menuLinks.length}`);
    console.log('Menu has been created >>> Going to the next step:');

    // running
    for (let i = 0; i < menuLinks.length; i++) {  // ; menuLinks.length;
        await page.goto(menuLinks[i]);
        await page.waitForLoadState('domcontentloaded');

        let totalPages = await page.$('div.pagination');
        totalPages = await totalPages.getAttribute('data-totalpages');

        //console.log( await totalPages);

        //const content = await page.$('#content');
        const infoContainer = await page.$$('div.info-container');
        //console.log( await content.getAttribute('.title.hidden-sm.hidden-md.hidden-lg') )

        await contentParsing(infoContainer);

        // right code
        // for (let key in infoContainer) {
        //     console.log( await infoContainer[key].$eval('a', el => el.innerText) );
        //     console.log( await infoContainer[key].$eval('a', el => el.getAttribute('href')))
        // }

        //await contentParsing(content);
        console.log(`# ${i+1} pages = ${await totalPages} <<< opened: ${await page.title()}`);

        if ( totalPages - 1 ) {
                const tempUrl = await page.url();
                let paginationPageUrl;
                try {
                    for (let i = 1; i < totalPages; i++) {
                        paginationPageUrl = `${tempUrl}P${i}00`;
                        await page.goto(paginationPageUrl);
                        await page.waitForLoadState('domcontentloaded');
                        const infoContainer = await page.$$('div.info-container');
                        await contentParsing(infoContainer);
                        console.log(`+--- subpage ${i+1} of ${await page.title()} ${paginationPageUrl}`); // +++
                    }
                } catch (err) {
                    console.log(err);
                }
        }
    }

    let goodsResultDataArr = []
    for (let key in goodsResultData) {
        goodsResultDataArr.push(key);
    }

    const goodsResultDataSet = new Set(goodsResultDataArr);

    console.log( `Total added goods quantity: ${Object.keys(goodsResultData).length}` );
    console.log(`Total unique positions: ${goodsResultDataSet.size}`);
    console.log(`Completed`, Object.keys(goodsResultData).length === goodsResultDataSet.size );

    //console.log(goodsResultData)

    await context.close();
    await browser.close();
    await console.timeEnd('run');
})();

