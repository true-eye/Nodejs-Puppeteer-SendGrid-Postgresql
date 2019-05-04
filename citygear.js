
const puppeteer = require('puppeteer');

citygear = async () => {
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
        await page.goto(`https://www.citygear.com/catalog/clearance/brand/nike-jordan-new-balance/gender/men-women/prod.-type/shoes/page/${page_index}/sort-by/news_from_date/sort-direction/desc/show/120.html`, { waitUntil: 'domcontentloaded', timeout: 0 });

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnNextPage = document.querySelectorAll('.toolbar > .pager > .pages > ol > .next');
            const productDetails = document.querySelectorAll('.products-grid > .item');
            for (var product of productDetails) {

                var productRef = null, productTitle = null, productPrice = null;

                if (product.firstElementChild && product.firstElementChild.nextElementSibling) {
                    var div_productName = product.firstElementChild.nextElementSibling;

                    if (div_productName.firstElementChild) {
                        var div_productName_a = div_productName.firstElementChild;
                        productRef = div_productName_a.getAttribute('href');
                        productTitle = div_productName_a.innerText;
                        productTitle = productTitle.split('"').join('');
                        productTitle = productTitle.replace(/'/g, '')
                    }

                    var div_pricebox = div_productName.nextElementSibling;

                    if (div_pricebox) {
                        if (div_pricebox.childElementCount == 2) {
                            var div_special = div_pricebox.lastElementChild
                            if (div_special) {
                                div_special_price = div_special.lastElementChild
                                if (div_special_price) {
                                    productPrice = div_special_price.innerHTML;
                                    if (productPrice.startsWith('\n$'))
                                        productPrice = productPrice.slice(2)
                                }
                            }
                        } else if (div_pricebox.childElementCount == 1) {
                            var div_msrpMessage = div_pricebox.firstElementChild
                            if (div_msrpMessage) {
                                productPrice = div_msrpMessage.innerHTML
                                if (productPrice.startsWith('\n')) {
                                    productPrice = productPrice.slice(1)
                                }
                            }
                        }
                    }
                    if (productRef && productTitle) {
                        products.push({ ref: productRef, title: productTitle, price: productPrice });
                    }
                } else {
                    console.log('citygear error occured')
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
exports.default = citygear;