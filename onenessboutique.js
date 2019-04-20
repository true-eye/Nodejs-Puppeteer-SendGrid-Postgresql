
const puppeteer = require('puppeteer');
var manageDBFile = require("./manageDBFile/index.js")


scrap_onenessboutique = async (func_name) => {
    console.log(func_name, '   Start   ');
    let message = `<h2 style="background: blue; color: white;">Onenessboutique.com</h2><br/>`
    let ret = await manageDBFile.load_from_file("onenessboutique.json").then(prevList => {
        return onenessboutique().then((currentList) => {

            console.log(func_name, ' getCurrentProductList success : ', currentList.length);

            var changedFlag = false;

            if (prevList.length > 0) {
                for (let i in currentList) {
                    const curItem = currentList[i];
                    const productsWithSameTitle = prevList.filter(item => item.title == curItem.title && item.ref == curItem.ref)

                    if (productsWithSameTitle.length == 0) {
                        // curItem is a new item
                        console.log(`******* ${func_name} new item launched ******`, curItem)

                        message += `<h4>------New Product Launched------
                                    ------Ref:  ${curItem.ref}, Title: ${curItem.title}, Price: ${curItem.price}</h4><br/>`

                        changedFlag = true;
                    } else {
                        const prevProduct = productsWithSameTitle[0];
                        if (curItem.price != prevProduct.price) {
                            console.log(`------ ${func_name} product price changed ------`, curItem, '::: prev price ::: ', prevProduct.price)

                            message += `<h4>------Product Price Changed------
                                    ------Ref:  ${curItem.ref}, Title: ${curItem.title}, Price: ${curItem.price}(origin: ${prevProduct.price})</h4><br/>`

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
            if (prevList.length == 0 || changedFlag == true) {
                manageDBFile.save_to_file("onenessboutique.json", currentList)
                    .then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(func_name, " saveToFile return error : ", err)
                    })
            }
            return message
        }).catch(err => {
            console.log(func_name, ' onenessboutique return error : ', err)
            return null;
        });
    }).catch(err => {
        console.log(func_name, ' loadFromFile return error : ', err)
        return null;
    })
    return ret;
}

onenessboutique = async () => {
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
        await page.goto(`https://www.onenessboutique.com/collections/sale?page=${page_index}`, { waitUntil: 'domcontentloaded', timeout: 0 });

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnNextPage = document.querySelectorAll('.paginate .next');
            const productDetails = document.querySelectorAll('.product-wrap > a > .product-details');
            for (var product of productDetails) {

                if (product.firstElementChild && product.lastElementChild && product.lastElementChild.firstElementChild) {
                    if (product.parentElement) {
                        const productRef = product.parentElement.getAttribute('href');
                        const productTitle = product.firstElementChild.innerHTML;
                        const productPrice = product.lastElementChild.firstElementChild.innerHTML;
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
exports.scrap_onenessboutique = scrap_onenessboutique;
exports.onenessboutique = onenessboutique;