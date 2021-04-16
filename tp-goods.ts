const { chromium } = require('playwright');
const cheerio = require('cheerio');

let browser, page, context;
const launchOpt = {
    headless: true,
    slowMo: 0,
};

const goodsResultData = {};
const menuLinks = [];
const baseURL = ''; // env clear  // await page.waitForLoadState('load'); 'domcontentloaded'
let currentPage = 0;
let goodsPerPage = 0;


const contentParsing = $ => {
    goodsPerPage = 0;
    $('.title.hidden-sm.hidden-md.hidden-lg').each( (iter, el) => {
        // console.log(`adding >>>` ,  $(el).text() );
        goodsResultData[$(el).text()] = {
            'url': $(`.title.hidden-sm.hidden-md.hidden-lg > a`).attr('href'),
            'art': $('.light.hidden-sm.hidden-md.hidden-lg').text(),
            'perice': $('.price').text(),
            'tp': 0,
            'mp+': 0,
            'mp': 0,

        };
        ++goodsPerPage;
        console.log( `${[$(el).text()]} ${goodsResultData[$(el).text()]['price']}` );
    })
    ++currentPage;
}

(async () => {
    console.time('run');
    browser = await chromium.launch( launchOpt );
    context = await browser.newContext();
    page = await context.newPage();

    // requests-decrease
    await page.route('**/*', route => {
        return route.request().resourceType() !== 'document' ? route.abort() : route.continue()
    });

    await page.goto(baseURL);
    await page.waitForLoadState('domcontentloaded');

    // create an array of menu links for looping
    let menuDom = await page.innerHTML('#collapseCatalogMenu');
    let $ = await cheerio.load(menuDom);
    $( 'li :not(:has(ul)) > a' ).each( (iter, el) => {
        menuLinks.push( $(el).attr('href') );
        //console.log( $(el).attr('href') );
    })

    console.log(`Total main menu links: ${menuLinks.length}`);
    console.log('>>> Next Step:');

    // watching for response status
    page.on('response',  response => {
        if ( response.status() !== 200 ) {
            console.log( `${response.status()} ` );
        }
    });

    // running
    for (let i = 0; i < 1; i++) {  // ; menuLinks.length;
        await page.goto(menuLinks[i]);
        await page.waitForLoadState('domcontentloaded');
        const $ = cheerio.load(await page.innerHTML('#content'));
        const totalPages = await $('div[class="pagination"]').attr('data-totalpages');
        await contentParsing($);
        //console.log(`# ${i+1} pages = ${await totalPages} <<< opened: ${await page.title()}`);
        console.log(`# ${currentPage} pages = ${await totalPages} GoodsPP ${goodsPerPage} \t<<< opened: ${await page.title()}`);

        if ( totalPages - 1 ) {
                const tempUrl = await page.url();
                let paginationPageUrl;
                try {
                    for (let i = 1; i < totalPages; i++) {
                        paginationPageUrl = `${tempUrl}P${i}00`;
                        await page.goto(paginationPageUrl);
                        await page.waitForLoadState('domcontentloaded');
                        const $ = cheerio.load(await page.innerHTML('#content'));
                        await contentParsing($);
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

    await context.close();
    await browser.close();
    await console.timeEnd('run');
})();

