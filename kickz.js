
const puppeteer = require('puppeteer');

kickz = async () => {
    // Actual Scraping goes Here...

    const chromeLaunchOptions = {
        // ignoreHTTPSErrors: true,
        headless: true,
        // timeout: 0,
        args: [
            '--disable-setuid-sandbox',
            '--no-sandbox',
        ],
    };

    const browser = await puppeteer.launch(chromeLaunchOptions);
    const page = await browser.newPage();

    let productList = [];

    let page_index = 1;

    while (1) {

        await page.goto(`https://www.kickz.com/us/sale/jordan,nike/Men/shoes/c?selectedPage=${page_index}`, { waitUntil: 'domcontentloaded', timeout: 0 });

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnNextPage = document.querySelectorAll('.pager .pagerBoxRight');
            const productDetails = document.querySelectorAll('#product_list_container > .product-info > .no-h-over');
            for (var product of productDetails) {
                const productRef = product.getAttribute('link');

                const div_detail_link_wrapper = product.firstElementChild;
                if (div_detail_link_wrapper) {
                    const div_headline = div_detail_link_wrapper.children[1];
                    const div_price = div_detail_link_wrapper.children[2];

                    if (div_headline && div_price) {
                        let productTitle = div_headline.innerText;
                        productTitle = productTitle.split('"').join('');
                        productTitle = productTitle.replace(/'/g, '')
                        const productPrice = div_price.lastElementChild.innerText;
                        products.push({ ref: productRef, title: productTitle, price: productPrice });
                    }
                }
            }

            return { products, bLastPage: btnNextPage[0].hasAttribute('href') == undefined || btnNextPage[0].hasAttribute('href') == '' }
        });

        console.log(`---------Page ${page_index} ${pageInfo.bLastPage}---------`);

        productList = [...productList, ...pageInfo.products]

        if (pageInfo.bLastPage == true)
            break;
        page_index++;
    }

    //console.log(productList.length)

    browser.close();
    return productList;
};
exports.default = kickz;