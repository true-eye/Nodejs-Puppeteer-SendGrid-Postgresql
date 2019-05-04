
const puppeteer = require('puppeteer');

bdgastore_balance = async () => {
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
        await page.goto(`https://bdgastore.com/collections/sale#?Collections=Sale&Producttype=Shoes&Vendor=New+Balance&res_per_page=60&search_return=all&page=${page_index}`);

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnPage = document.querySelectorAll('.pagination > .next');
            const productDetails = document.querySelectorAll('.product-grid-item');
            for (var product of productDetails) {
                const div_image = product.children[1];
                const div_vendor = product.children[2];
                const div_name = product.children[3];
                const div_price = product.children[4];

                if (div_vendor && div_name && div_price) {
                    const productRef = div_image.getAttribute('href');
                    let productTitle = div_vendor.innerText + ' ' + div_name.innerText;

                    productTitle = productTitle.split('"').join('');
                    productTitle = productTitle.replace(/'/g, '')
                    const productPrice = div_price.firstElementChild.innerText

                    products.push({ ref: productRef, title: productTitle, price: productPrice });
                }
            }

            return { products, bLastPage: btnPage[0] == undefined }
        });

        console.log(`---------Page ${page_index} ${pageInfo.bLastPage}---------`, pageInfo.products.length);

        productList = [...productList, ...pageInfo.products]

        if (pageInfo.bLastPage == true)
            break;
        page_index++;
    }

    //console.log(productList.length)

    browser.close();
    return productList;
};
exports.default = bdgastore_balance;