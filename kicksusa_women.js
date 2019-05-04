
const puppeteer = require('puppeteer');

kicksusa_women = async () => {
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

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

    while (1) {
        await page.goto(`https://www.kicksusa.com/sale-womens-shoes.html?brands=78&limit=36%3Fp%3D1&p=${page_index}`, { waitUntil: 'domcontentloaded', timeout: 0 });

        const pageInfo = await page.evaluate(() => {
            let products = [];
            const productDetails = document.querySelectorAll('.products-grid > li > .item > .item-info');
            for (var product of productDetails) {
                const div_show = product.children[0];
                const div_price = product.children[1];
                if (div_show && div_price) {
                    const productRef = div_show.firstElementChild.getAttribute('href');
                    let productTitle = div_show.firstElementChild.getAttribute('title');
                    productTitle = productTitle.split('"').join('');
                    productTitle = productTitle.replace(/'/g, '')

                    const div_special_price = div_price.getElementsByClassName('special-price')[0];
                    const div_regular_price = div_price.getElementsByClassName('regular-price')[0];
                    if (div_special_price) {
                        const productPrice = div_special_price.lastElementChild.innerText
                        products.push({ ref: productRef, title: productTitle, price: productPrice });
                    } else {
                        if (div_regular_price) {
                            const productPrice = div_regular_price.firstElementChild.innerText
                            products.push({ ref: productRef, title: productTitle, price: productPrice });
                        } else {
                            const productPrice = "SEE CART FOR PRICE"
                            products.push({ ref: productRef, title: productTitle, price: productPrice });
                        }
                    }

                }
            }

            return { products, bLastPage: products.length != 36 }
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
exports.default = kicksusa_women;