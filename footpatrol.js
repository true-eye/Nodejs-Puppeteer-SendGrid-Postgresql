
const puppeteer = require('puppeteer');

footpatrol = async () => {
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

    let page_index = 0;

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

    while (1) {
        await page.goto(`https://www.footpatrol.com/footwear/mens-footwear/brand/nike,jordan,new-balance/sale/?max=204`);
        console.log(await page.content())
        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnPage = document.querySelectorAll('.pageLinks');
            let bLast = true;
            if (btnPage && btnPage[0]) {
                let btnNext = btnPage[0].lastElementChild
                if (btnNext && !btnNext.classList.contains('disabled')) {
                    bLast = false;
                }
            }
            const productDetails = document.querySelectorAll('.productListItem  > .itemContainer > .itemInformation');
            for (var product of productDetails) {
                const div_name = product.children[0];
                const div_price = product.children[1];

                if (div_name && div_price) {
                    const productRef = "https://www.footpatrol.com" + div_name.firstElementChild.getAttribute('href');
                    let productTitle = div_name.innerText;

                    productTitle = productTitle.split('"').join('');
                    productTitle = productTitle.replace(/'/g, '')

                    const div_sale_badge = div_price.lastElementChild
                    if (div_sale_badge && div_sale_badge.lastElementChild && div_sale_badge.lastElementChild.lastElementChild) {
                        const productPrice = div_sale_badge.lastElementChild.lastElementChild.innerText
                        products.push({ ref: productRef, title: productTitle, price: productPrice });
                    }
                }
            }

            return { products, bLastPage: bLast }
        });

        console.log(`---------Page ${page_index} ${pageInfo.bLastPage}---------`, pageInfo.products.length);

        productList = [...productList, ...pageInfo.products]

        //if (pageInfo.bLastPage == true)
        break;
        page_index += 24;
    }

    //console.log(productList.length)

    browser.close();
    return productList;
};
exports.default = footpatrol;