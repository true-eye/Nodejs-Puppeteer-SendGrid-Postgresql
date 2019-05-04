
const puppeteer = require('puppeteer');

sotostore = async () => {
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
        await page.goto(`https://www.sotostore.com/en/151/footwear/${page_index}?p=2189&p=21364&p=40456&orderBy=Published`, { waitUntil: 'domcontentloaded', timeout: 0 });

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnNextPage = document.querySelectorAll('.pagination-buttons > .next-page-control');
            const productDetails = document.querySelectorAll('.product-list > .card > .card-content');
            for (var product of productDetails) {
                const div_brand = product.children[0];
                const div_name = product.children[1];
                const div_price = product.children[2];
                if (div_brand && div_name && div_price) {
                    const productVendor = div_brand.innerText;
                    if (productVendor.toUpperCase().includes('NIKE') || productVendor.toUpperCase().includes('JORDAN')) {
                        const productRef = "https://www.sotostore.com" + product.getAttribute('href');
                        let productTitle = productVendor + " " + div_name.innerText;

                        productTitle = productTitle.split('"').join('');
                        productTitle = productTitle.replace(/'/g, '')
                        const productPrice = div_price.lastElementChild.children[1].innerText;
                        products.push({ ref: productRef, title: productTitle, price: productPrice });
                    }
                }
            }

            return { products, bLastPage: btnNextPage[0].classList.contains('is-disabled') }
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
exports.default = sotostore;