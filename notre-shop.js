
const puppeteer = require('puppeteer');

notreshop = async () => {
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
        await page.goto(`https://www.notre-shop.com/collections/sale?page=${page_index}&sort_by=created-descending`, { waitUntil: 'domcontentloaded', timeout: 0 });

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnNextPage = document.querySelectorAll('.pagination .active');
            const productDetails = document.querySelectorAll('.product-block > .product-desc .prTitle');
            for (var product of productDetails) {
                const div_brand = product.children[0];
                const div_title = product.children[1];
                const div_price = product.children[2];

                if (div_brand && div_title && div_price) {
                    const productVendor = div_brand.innerText;
                    if (productVendor.toUpperCase().includes('NIKE') || productVendor.toUpperCase().includes('JORDAN')) {
                        const productRef = "https://www.notre-shop.com" + div_title.firstElementChild.getAttribute('href');
                        let productTitle = div_title.firstElementChild.getAttribute('title');
                        productTitle = productTitle.split('"').join('');
                        productTitle = productTitle.replace(/'/g, '')
                        const productPrice = div_price.firstElementChild.innerText;
                        products.push({ ref: productRef, title: productTitle, price: productPrice });
                    }
                }
            }

            return { products, bLastPage: btnNextPage[0].nextElementSibling == undefined }
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
exports.default = notreshop;