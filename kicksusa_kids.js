
const puppeteer = require('puppeteer');
var manageDBFile = require("./manageDBFile/index.js")


scrap_kicksusa_kids = async (func_name) => {
    console.log(func_name, '   Start   ');
    let message = `<h2 style="background: white; color: red; text-align: center;">kicksusa_kids.com</h2>`
    let ret = await manageDBFile.load_from_file("kicksusa_kids.json").then(prevList => {
        return kicksusa_kids().then((currentList) => {

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


            {
                manageDBFile.save_to_file("kicksusa_kids.json", currentList)
                    .then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(func_name, " saveToFile return error : ", err)
                    })
            }
            return message
        }).catch(err => {
            console.log(func_name, ' kicksusa_kids return error : ', err)
            return null;
        });
    }).catch(err => {
        console.log(func_name, ' loadFromFile return error : ', err)
        return null;
    })
    return ret;
}

kicksusa_kids = async () => {
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
        await page.goto(`https://www.kicksusa.com/sale-kids-grade-school.html?brands=78_63&footware_size=340_294_292_298_296_302_300_305&limit=72%3Fp%3D1&p=${page_index}`, { waitUntil: 'domcontentloaded', timeout: 0 });

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

        console.log(`---------Page ${page_index} ${pageInfo.bLastPage}---------`, ...pageInfo.products.map(p => p.price));

        productList = [...productList, ...pageInfo.products]

        if (pageInfo.bLastPage == true)
            break;
        page_index++;
    }

    //console.log(productList.length)

    browser.close();
    return productList;
};
exports.scrap_kicksusa_kids = scrap_kicksusa_kids;
exports.kicksusa_kids = kicksusa_kids;