
const puppeteer = require('puppeteer');

asphaltgold = async () => {
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
        await page.goto(`https://asphaltgold.de/en/sale?manufacturer=28&p=${page_index}`, { waitUntil: 'domcontentloaded', timeout: 0 });

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnNextPage = document.querySelectorAll('.toolbar .pages .next');
            const productDetails = document.querySelectorAll('.product-grid > .item > .product-details');
            for (var product of productDetails) {
                const div_product_name = product.children[0];
                const div_product_price = product.children[1];

                if (div_product_name && div_product_price) {
                    const div_href = div_product_name.firstElementChild;
                    const productRef = div_href.getAttribute('href');
                    let productTitle = div_href.getAttribute('title');
                    productTitle = productTitle.split('"').join('');
                    productTitle = productTitle.replace(/'/g, '')

                    const div_special_price = div_product_price.lastElementChild;
                    if (div_special_price) {
                        const productPrice = div_special_price.lastElementChild.innerText;
                        products.push({ ref: productRef, title: productTitle, price: productPrice });
                    }
                }
            }

            return { products, bLastPage: btnNextPage[0] == undefined }
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
exports.default = asphaltgold;