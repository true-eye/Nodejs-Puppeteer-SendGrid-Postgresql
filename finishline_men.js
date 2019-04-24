
const puppeteer = require('puppeteer');
var manageDBFile = require("./manageDBFile/index.js")


scrap_finishline_men = async (func_name) => {
    console.log(func_name, '   Start   ');
    let ret = await manageDBFile.load_from_file("finishline_men.json").then(prevList => {
        return finishline_men().then((currentList) => {

            console.log(func_name, ' getCurrentProductList success : ', currentList.length);

            var changedFlag = false;
            let message = ""

            if (prevList.length > 0) {
                for (let i in currentList) {
                    const curItem = currentList[i];
                    const productsWithSameTitle = prevList.filter(item => item.title == curItem.title && item.ref == curItem.ref)

                    if (productsWithSameTitle.length == 0) {
                        // curItem is a new item
                        console.log(`******* ${func_name} new item launched ******`, curItem)

                        message += `<br/>https://www.finishline.com/store/sale/men/shoes/nike/jordan/adidas<br/>
                                                        ------New Product Launched------
                                    ------Ref:  ${curItem.ref}, Title: ${curItem.title}, Price: ${curItem.price}`

                        changedFlag = true;
                    } else {
                        const prevProduct = productsWithSameTitle[0];
                        if (curItem.price != prevProduct.price) {
                            console.log(`------ ${func_name} product price changed ------`, curItem, '::: prev price ::: ', prevProduct.price)

                            message += `<br/>https://www.finishline.com/store/sale/men/shoes/nike/jordan/adidas<br/>
                                                        ------Product Price Changed------
                                    ------Ref:  ${curItem.ref}, Title: ${curItem.title}, Price: ${curItem.price}(origin: ${prevProduct.price})`

                            changedFlag = true;
                        }
                    }
                }
            }

            if (changedFlag == false) {
                console.log(func_name, ' no changes')
                message += `<br/>https://www.finishline.com/store/sale/men/shoes/nike/jordan/adidas  :   No Changes<br/> `
            }

            // save changed product list
            //if (prevList.length == 0 || changedFlag == true) 
            {
                manageDBFile.save_to_file("finishline_men.json", currentList)
                    .then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(func_name, " saveToFile return error : ", err)
                    })
            }
            return message
        }).catch(err => {
            console.log(func_name, ' finishline_men return error : ', err)
            return null;
        });
    }).catch(err => {
        console.log(func_name, ' loadFromFile return error : ', err)
        return null;
    })
    return ret;
}

finishline_men = async () => {
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
        await page.goto(`http://www.finishline.com`);

        const pageInfo = await page.evaluate(() => {
            let products = [];
            //let btnNextPage = document.querySelectorAll('.paginate .next');
            return { products: document.innerHTML, bLastPage: true }
            const productDetails = document.querySelectorAll('.product-card > .product-card__details');
            for (var product of productDetails) {

                if (product.firstElementChild && product.firstElementChild.nextElementSibling) {
                    var element = product.firstElementChild.nextElementSibling;

                    if (element.firstElementChild && element.nextElementSibling && element.nextElementSibling.lastElementChild) {
                        const productRef = element.getAttribute('href');
                        let productTitle = element.firstElementChild.innerHTML;

                        productTitle = productTitle.split('"').join('');
                        productTitle = productTitle.replace(/'/g, '')

                        element = element.nextElementSibling;
                        const productPrice = element.lastElementChild.innerHTML;
                        products.push({ ref: productRef, title: productTitle, price: productPrice });
                    } else {
                        console.log('finishline_men error occured')
                    }
                } else {
                    console.log('finishline_men error occured')
                }
            }

            return { products, bLastPage: true }
        });

        console.log(`---------Page ${page_index} ${pageInfo.bLastPage}---------`, pageInfo);

        productList = [...productList, ...pageInfo.products]

        //if (pageInfo.bLastPage == true)
        break;
        page_index++;
    }

    //console.log(productList.length)

    browser.close();
    return productList;
};
exports.scrap_finishline_men = scrap_finishline_men;
exports.finishline_men = finishline_men;