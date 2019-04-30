
const puppeteer = require('puppeteer');
var manageDBFile = require("./manageDBFile/index.js")

var randomUseragent = require('random-useragent');
const request = require('request-promise-native');
const poll = require('promise-poller').default;

scrap_endclothing = async (func_name) => {
    console.log(func_name, '   Start   ');
    let message = `<h2 style="background: white; color: red; text-align: center;"><a>kicksusa.com</a>   Kids</h2>`
    let ret = await manageDBFile.load_from_file("endclothing.json").then(prevList => {
        return endclothing().then((currentList) => {

            console.log(func_name, ' getCurrentProductList success : ', currentList.length);

            var changedFlag = false;


            if (prevList.length > 0) {
                for (let i in currentList) {
                    const curItem = currentList[i];
                    const productsWithSameTitle = prevList.filter(item => item.title == curItem.title && item.ref == curItem.ref)

                    if (productsWithSameTitle.length == 0) {
                        // curItem is a new item
                        console.log(`******* ${func_name} new item launched ******`, curItem)

                        message += `<h4>New Product Launched Ref: <a>${curItem.ref}</a>, Title: ${curItem.title}, Price: ${curItem.price}</h4><br/>`

                        changedFlag = true;
                    } else {
                        const prevProduct = productsWithSameTitle[0];
                        if (curItem.price != prevProduct.price) {
                            console.log(`------ ${func_name} product price changed ------`, curItem, '::: prev price ::: ', prevProduct.price)

                            message += `<h4>Product Price Changed Ref:  <a>${curItem.ref}</a>, Title: ${curItem.title}, Price: ${curItem.price}(origin: ${prevProduct.price})</h4><br/>`

                            changedFlag = true;
                        }
                    }
                }
            }

            if (changedFlag == false) {
                console.log(func_name, ' no changes')
                message += `<h4 style="color: red;">No Changes</h4> `
            }

            // save changed product list
            //if (prevList.length == 0 || changedFlag == true) 

            if (true) {
                manageDBFile.save_to_file("endclothing.json", currentList)
                    .then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(func_name, " saveToFile return error : ", err)
                    })
            }
            return message
        }).catch(err => {
            console.log(func_name, ' endclothing return error : ', err)
            return null;
        });
    }).catch(err => {
        console.log(func_name, ' loadFromFile return error : ', err)
        return null;
    })
    return ret;
}

endclothing = async () => {
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

        await page.goto(`https://www.endclothing.com/us/sale/sale-footwear?brand=158-571910&p=${page_index}&size_toggle=small`, { waitUntil: 'domcontentloaded' });

        const isCaptcha = await page.evaluate(() => {
            //let gCaptcha = document.getElementById("g-recaptcha-response");
            let gCaptcha = document.querySelectorAll('.product-items');
            return gCaptcha.length == 0
        });

        console.log(isCaptcha)

        if (isCaptcha) {
            console.log('--Entering to Captcha Mode--')
            const apiKey = "962808d9cfd77925df940b91ffa12ca5"

            const requestId = await initiateCaptchaRequest(apiKey);

            const response = await pollForRequestResults(apiKey, requestId);

            await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${response}";`);

            await Promise.all([page.evaluate('document.getElementById("distilCaptchaForm").submit();'), page.waitForNavigation()]);
        }

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnNextPage = document.querySelectorAll('.pages > .c-pagination > .pages-item-next');
            const productDetails = document.querySelectorAll('.product-items > .product-item > .product-item-info > .product-item-details');
            for (var product of productDetails) {

                const div_name = product.children[0];
                const div_color = product.children[1];
                const div_price = product.children[2];

                if (div_name && div_color && div_price) {
                    const productRef = div_name.firstElementChild.getAttribute('href');
                    let productTitle = div_name.firstElementChild.innerText + ' ' + div_color.innerText;
                    productTitle = productTitle.split('"').join('');
                    productTitle = productTitle.replace(/'/g, '')

                    const productPrice = div_price.firstElementChild.firstElementChild.firstElementChild.lastElementChild.innerText
                    products.push({ ref: productRef, title: productTitle, price: productPrice });
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
exports.scrap_endclothing = scrap_endclothing;
exports.endclothing = endclothing;

const siteDetails = {
    sitekey: '6LdC3UgUAAAAAJIcyA3Ym4j_nCP-ainSgf1NoFku',
    pageurl: 'https://www.endclothing.com/us/sale/sale-footwear'
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