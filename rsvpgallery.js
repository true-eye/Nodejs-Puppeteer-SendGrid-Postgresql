
const puppeteer = require('puppeteer');
var manageDBFile = require("./manageDBFile/index.js")


scrap_rsvpgallery = async (func_name) => {
    console.log(func_name, '   Start   ');
    let message = `<h2 style="background: white; color: red; text-align: center;">rsvpgallery.com</h2>`
    let ret = await manageDBFile.load_from_file("rsvpgallery.json").then(prevList => {
        return rsvpgallery().then((currentList) => {

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
                manageDBFile.save_to_file("rsvpgallery.json", currentList)
                    .then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(func_name, " saveToFile return error : ", err)
                    })
            }
            return message
        }).catch(err => {
            console.log(func_name, ' rsvpgallery return error : ', err)
            return null;
        });
    }).catch(err => {
        console.log(func_name, ' loadFromFile return error : ', err)
        return null;
    })
    return ret;
}

rsvpgallery = async () => {
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
        await page.goto(`https://rsvpgallery.com/collections/converse`);
        console.log(await page.content())
        const pageInfo = await page.evaluate(() => {
            let products = [];
            const productDetails = document.querySelectorAll('.product > .product-details');
            for (var product of productDetails) {
                const div_name = product.children[0];
                const div_price = product.children[1];

                if (div_name && div_price) {
                    const productRef = "https://rsvpgallery.com" + div_name.getAttribute('href');
                    let productTitle = div_name.lastElementChild.innerText;

                    productTitle = productTitle.split('"').join('');
                    productTitle = productTitle.replace(/'/g, '')

                    const div_sale = div_price.firstElementChild
                    if (div_sale) {
                        const productPrice = div_sale.innerText
                        products.push({ ref: productRef, title: productTitle, price: productPrice });
                    }
                }
            }

            return { products, bLastPage: true }
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
exports.scrap_rsvpgallery = scrap_rsvpgallery;
exports.rsvpgallery = rsvpgallery;