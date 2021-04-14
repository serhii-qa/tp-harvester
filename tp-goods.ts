const { chromium } = require('playwright');
const cheerio = require('cheerio');

let browser, page, context;
const launchOpt = {
    headless: true,
    slowMo: 0,
};

const goodsResultData = {};
const menuLinks = [];
const baseURL = ''; // env clear  // await page.waitForLoadState('load');


const contentParsing = $ => {
    $('.title.hidden-sm.hidden-md.hidden-lg').each( (iter, el) => {
        //console.log(`loop>>>` ,  $(el).text() );
        goodsResultData[$(el).text()] =  $(`.title.hidden-sm.hidden-md.hidden-lg > a`).attr('href');
    })
}


(async () => {
    console.time('run');

    browser = await chromium.launch( launchOpt );
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(baseURL);

    // create an array of menu links for looping
    let menuDom = await page.innerHTML('#collapseCatalogMenu');
    let $ = await cheerio.load(menuDom);

    $( 'li :not(:has(ul)) > a' ).each( (iter, el) => {
        menuLinks.push( $(el).attr('href') );
    })

    console.log(menuLinks);
    console.log('>>> Next Step:')

    // watching for response status
    page.on('response',  response => {
        if ( response.status() !== 200 ) {
            console.log( response.status() )
        }
    });

    // running
    //for (let i = 0; i < menuLinks.length; i++) {
    for (let i = 0; i < menuLinks.length; i++) {
        await page.goto(menuLinks[i]);
        const $ = cheerio.load(await page.innerHTML('#content'))
        const totalPages = await $('div[class="pagination"]').attr('data-totalpages')
        console.log(`# ${i+1} pages = ${await totalPages} <<< opened: ${await page.title()}`);
        await contentParsing($);
    }


    //console.log(goodsResultData)
    console.log(Object.keys(goodsResultData).length)

    //console.log(`123456`, $('.title.hidden-sm.hidden-md.hidden-lg').html() );




    // // todo pagination pages url generator
    // if ( await hasPagination(urllll) > 1  ) {
    //     const firstPageUrl = page.url();
    //
    //     try {
    //         for (let i = 1; i < 2; i++) {
    //             //console.log(urlPaginationPage + `P${i}00`)
    //            // console.log(`>>> Page = ${i+1}`);
    //             let $ = cheerio.load(await page.innerHTML('#content'))
    //             //console.log($.html())
    //
    //         }
    //     } catch (err) {
    //         console.log(err)
    //     }
    //
    // }




    // console.log( await $('.item-container.clearfix').html() )



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



    await context.close();
    await browser.close();

    await console.timeEnd('run')
})();

