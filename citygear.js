
const puppeteer = require('puppeteer');
var manageDBFile = require("./manageDBFile/index.js")


scrap_citygear = async (func_name) => {
    console.log(func_name, '   Start   ');
    let siteURL = "https://www.citygear.com/catalog/clearance/brand/nike-jordan-new-balance/prod.-type/shoes/sort-by/news_from_date/sort-direction/desc.html"

    let ret = await manageDBFile.load_from_file("citygear.json").then(prevList => {
        return citygear().then((currentList) => {

            console.log(func_name, ' getCurrentProductList success : ', currentList.length);

            var changedFlag = false;
            let message = `<h2 style="background: white; color: red; text-align: center;">www.citygear.com</h2>`

            if (prevList.length > 0) {
                for (let i in currentList) {
                    const curItem = currentList[i];
                    const productsWithSameTitle = prevList.filter(item => item.title == curItem.title && item.ref == curItem.ref)

                    if (productsWithSameTitle.length == 0) {
                        // curItem is a new item
                        console.log(`******* ${func_name} new item launched ******`, curItem)

                        message += `<h4>New Product Launched Ref: ${curItem.ref}, Title: ${curItem.title}, Price: ${curItem.price}</h4><br/>`

                        changedFlag = true;
                    } else {
                        const prevProduct = productsWithSameTitle[0];
                        if (curItem.price != prevProduct.price) {
                            console.log(`------ ${func_name} product price changed ------`, curItem, '::: prev price ::: ', prevProduct.price)

                            message += `<h4>Product Price Changed Ref: ${curItem.ref}, Title: ${curItem.title}, Price: ${curItem.price}(origin: ${prevProduct.price})</h4><br/>`

                            changedFlag = true;
                        }
                    }
                }
            }

            if (changedFlag == false) {
                console.log(func_name, ' no changes')
                message += `<h4 style="color: red;">No Changes</h4><br/>`
            }

            // save changed product list
            //if (prevList.length == 0 || changedFlag == true)
            {
                manageDBFile.save_to_file("citygear.json", currentList)
                    .then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(func_name, " saveToFile return error : ", err)
                    })
            }
            return message
        }).catch(err => {
            console.log(func_name, ' citygear return error : ', err)
            return null;
        });
    }).catch(err => {
        console.log(func_name, ' loadFromFile return error : ', err)
        return null;
    })
    return ret;
}

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
exports.scrap_citygear = scrap_citygear;
exports.citygear = citygear;