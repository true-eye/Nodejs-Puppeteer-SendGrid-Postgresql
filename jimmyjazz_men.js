
const puppeteer = require('puppeteer');
var randomUseragent = require('random-useragent');
//var request = require('request');
const request = require('request-promise-native');
const poll = require('promise-poller').default;

jimmyjazz_men = async () => {
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
    await page.setUserAgent(randomUseragent.getRandom())

    let productList = [];

    let page_index = 1;

    while (1) {
        await page.goto(`https://www.jimmyjazz.com/clearance?category=footwear&gender=mens&page=${page_index}`, { waitUntil: 'domcontentloaded', timeout: 0 });

        const isCaptcha = await page.evaluate(() => {
            let gCaptcha = document.getElementById("challenge-form");
            //let gCaptcha = document.getElementsByTagName("body");
            return (gCaptcha != null && gCaptcha.innerHTML != '')
        });

        console.log(isCaptcha)

        if (isCaptcha) {
            console.log('--Entering to Captcha Mode--')
            //const apiKey = "1a21be9ca8506169bd5b2a310457a8d0"
            const apiKey = "962808d9cfd77925df940b91ffa12ca5"

            const requestId = await initiateCaptchaRequest(apiKey);

            const response = await pollForRequestResults(apiKey, requestId);

            await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${response}";`);

            await Promise.all([page.evaluate('document.getElementById("challenge-form").submit();'), page.waitForNavigation()]);
        }

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnNextPage = document.querySelectorAll('.pagination > .pagination_next > a');
            const productDetails = document.querySelectorAll('.product_grid > .product_grid_item');
            //return { products: document.getElementsByTagName('body')[0].innerHTML, bLastPage: btnNextPage[0] == undefined }
            for (var product of productDetails) {

                var productRef = null, productTitle = null, productPrice = null;

                if (product.children[2]) {
                    var div_productgrid_info = product.children[2];

                    if (div_productgrid_info.firstElementChild && div_productgrid_info.lastElementChild) {
                        var div_productgrid_brand_a = div_productgrid_info.firstElementChild.firstElementChild;
                        var div_productgrid_title_a = div_productgrid_info.lastElementChild.firstElementChild;

                        if (div_productgrid_brand_a && div_productgrid_title_a) {
                            productRef = "www.jimmyjazz_men.com" + div_productgrid_brand_a.getAttribute('href');

                            if (div_productgrid_title_a.lastElementChild) {
                                var div_product_size = div_productgrid_title_a.lastElementChild
                                productTitle = div_productgrid_brand_a.innerText + div_productgrid_title_a.innerText;

                                productTitle = productTitle.split('"').join('');
                                productTitle = productTitle.replace(/'/g, '')
                            }

                        } else {
                            console.log('jimmyjazz_men error occured line: 102')
                        }

                    }

                    var div_pricebox = div_productgrid_info.nextElementSibling;

                    if (div_pricebox) {
                        if (div_pricebox.childElementCount == 2) {
                            var div_product_price = div_pricebox.firstElementChild
                            if (div_product_price) {
                                productPrice = div_product_price.innerHTML;
                                if (productPrice.startsWith('$'))
                                    productPrice = productPrice.slice(1)
                            }
                        } else if (div_pricebox.childElementCount == 1) {
                            console.log('jimmyjazz_men error occured line: 124')
                        }
                    }
                    if (productRef && productTitle) {
                        if (productTitle.toUpperCase().includes('NIKE') || productTitle.toUpperCase().includes('JORDAN'))
                            products.push({ ref: productRef, title: productTitle, price: productPrice });
                    }
                } else {
                    console.log('jimmyjazz_men error occured')
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
exports.default = jimmyjazz_men;

const siteDetails = {
    sitekey: '6LfBixYUAAAAABhdHynFUIMA_sa4s-XsJvnjtgB0',
    pageurl: 'https://www.jimmyjazz.com/clearance?category=footwear?page=1'
}

async function initiateCaptchaRequest(apiKey) {
    const formData = {
        method: 'userrecaptcha',
        googlekey: siteDetails.sitekey,
        key: apiKey,
        pageurl: siteDetails.pageurl,
        json: 1
    };
    const response = await request.post('http://2captcha.com/in.php', { form: formData });
    return JSON.parse(response).request;
}

async function pollForRequestResults(key, id, retries = 30, interval = 1500, delay = 15000) {
    await timeout(delay);
    return poll({
        taskFn: requestCaptchaResults(key, id),
        interval,
        retries
    });
}

function requestCaptchaResults(apiKey, requestId) {
    const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
    return async function () {
        return new Promise(async function (resolve, reject) {
            const rawResponse = await request.get(url);
            const resp = JSON.parse(rawResponse);
            if (resp.status === 0) return reject(resp.request);
            resolve(resp.request);
        });
    }
}

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))