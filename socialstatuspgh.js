
const puppeteer = require('puppeteer');
var manageDBFile = require("./manageDBFile/index.js")


scrap_socialstatuspgh = async (func_name) => {
    console.log(func_name, '   Start   ');
    let message = `<h2 style="background: white; color: red; text-align: center;">socialstatuspgh.com</h2>`
    let ret = await manageDBFile.load_from_file("socialstatuspgh.json").then(prevList => {
        return socialstatuspgh().then((currentList) => {

            console.log(func_name, ' getCurrentProductList success : ', currentList.length);

            var changedFlag = false;


            if (prevList.length > 0) {
                for (let i in currentList) {
                    const curItem = currentList[i];
                    const productsWithSameTitle = prevList.filter(item => item.title == curItem.title && item.ref == curItem.ref)

                    if (productsWithSameTitle.length == 0) {
                        // curItem is a new item
                        console.log(`******* ${func_name} new item launched ******`, curItem)

                        message += `<h4>New Product Launched Ref: <a href="${curItem.ref}">${curItem.ref}</a>, Title: ${curItem.title}, Price: ${curItem.price}</h4><br/>`

                        changedFlag = true;
                    } else {
                        const prevProduct = productsWithSameTitle[0];
                        if (curItem.price != prevProduct.price) {
                            console.log(`------ ${func_name} product price changed ------`, curItem, '::: prev price ::: ', prevProduct.price)

                            message += `<h4>Product Price Changed Ref:  <a href="${curItem.ref}">${curItem.ref}</a>, Title: ${curItem.title}, Price: ${curItem.price}(origin: ${prevProduct.price})</h4><br/>`

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
                manageDBFile.save_to_file("socialstatuspgh.json", currentList)
                    .then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(func_name, " saveToFile return error : ", err)
                    })
            }
            return message
        }).catch(err => {
            console.log(func_name, ' socialstatuspgh return error : ', err)
            return null;
        });
    }).catch(err => {
        console.log(func_name, ' loadFromFile return error : ', err)
        return null;
    })
    return ret;
}

socialstatuspgh = async () => {
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
        await page.goto(`https://www.socialstatuspgh.com/collections/sales?page=${page_index}`);

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnPage = document.querySelectorAll('#Collection > .pagination .btn');
            let bLast = true;
            if (btnPage) {
                let btnNext = btnPage[1]
                if (btnNext && !btnNext.classList.contains('btn--disabled')) {
                    bLast = false;
                }
            }
            const productDetails = document.querySelectorAll('.collection-products > .product > .product-card');
            for (var product of productDetails) {
                const productRef = "https://www.socialstatuspgh.com" + product.getAttribute('href');
                const div_text = product.children[1];
                if (div_text) {
                    const div_name = div_text.children[0];
                    const div_price = div_text.children[1];
                    if (div_name && div_price) {
                        let productTitle = div_name.innerText;

                        productTitle = productTitle.split('"').join('');
                        productTitle = productTitle.replace(/'/g, '')

                        if (productTitle.toUpperCase().includes('NIKE') || productTitle.toUpperCase().includes('JORDAN')) {
                            const productPrice = div_price.lastElementChild.innerText;
                            products.push({ ref: productRef, title: productTitle, price: productPrice });
                        }
                    }
                }
            }

            return { products, bLastPage: bLast }
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
exports.scrap_socialstatuspgh = scrap_socialstatuspgh;
exports.socialstatuspgh = socialstatuspgh;