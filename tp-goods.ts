const { chromium } = require('playwright');
const cheerio = require('cheerio');

let browser, page, context;
const launchOpt = {
    headless: false,
    slowMo: 0,
};

const baseURL = ''; // env clear
/// await page.waitForLoadState('load');

(async () => {
    console.time('run')

    browser = await chromium.launch(launchOpt);
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(baseURL);

    // page.on('request', (request) => {
    //     console.log('>>', request.method(), request.url());
    // });
    // page.on('response', (response) => {
    //     console.log('<<', response.status(), response.url());
    //     console.log('data:\n');
    // });

    let data = await page.innerHTML('#collapseCatalogMenu');
    let $ = await cheerio.load(data);

    let menuLinks = [];
    $( 'li :not(:has(ul)) > a').each((i, el) => {
        menuLinks.push( $(el).attr('href') );
    })
    console.log(menuLinks);

    console.log('>>> Next Step:')

    await page.goto( `` ) //env clear

    //await page.click('div[class="button-global-more"] span[class="text"]')
    $ = cheerio.load(await page.innerHTML('body'))
    const paginationPages = await $('div[class="pagination"]').attr('data-totalpages')
    console.log( `Pagination pages Pages = ${await paginationPages}` )

    // div[class='items-container']






    if ( await paginationPages > 1  ) {

        try {
            for (let i = 1; i < paginationPages; i++) {
                let url = page.url();
                console.log(url + `P${i}00`)

                //await page.click('div[class="button-global-more"] span[class="text"]')
                console.log(`Page = ${i+1}`);

                let $ = cheerio.load(await page.innerHTML('body'))
                console.log($.html())

            }
        } catch (err) {
            console.log(err)
        }

    }

    console.log( await $('.item-container.clearfix').html() )


    $ = cheerio.load(await page.innerHTML('body'))
    console.log(
        await $('div[class="button-global-more"]').attr('style') //????
    );



    /////////////////////////
    //flood
    //
    // for (let i = 0; i < 1; i++) {
    //     page = await context.newPage();
    //     let newPage = await page.goto(menuLinks[i]);
    //     $ = await cheerio.load(newPage);
    //
    //     console.log( $('.item-container .clearfix').html() );
    //     console.log( `Open ${i + 1} of ${menuLinks.length} | Page title: ${await page.title()} `  );
    // }
    //



    //await context.close();
    //await browser.close();

    await console.timeEnd('run')
})();

