
const puppeteer = require('puppeteer');
var manageDBFile = require("./manageDBFile/index.js")


scrap_bdgastore_jordan = async (func_name) => {
    console.log(func_name, '   Start   ');
    let message = `<h2 style="background: white; color: red; text-align: center;">bdgastore_jordan.com Jordan</h2>`
    let ret = await manageDBFile.load_from_file("bdgastore_jordan.json").then(prevList => {
        return bdgastore_jordan().then((currentList) => {

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
                manageDBFile.save_to_file("bdgastore_jordan.json", currentList)
                    .then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(func_name, " saveToFile return error : ", err)
                    })
            }
            return message
        }).catch(err => {
            console.log(func_name, ' bdgastore_jordan return error : ', err)
            return null;
        });
    }).catch(err => {
        console.log(func_name, ' loadFromFile return error : ', err)
        return null;
    })
    return ret;
}

bdgastore_jordan = async () => {
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
        await page.goto(`https://bdgastore.com/collections/sale#?Collections=Sale&Producttype=Shoes&Vendor=Air+Jordan&res_per_page=60&search_return=all&page=${page_index}`);

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnPage = document.querySelectorAll('.pagination > .next');
            const productDetails = document.querySelectorAll('.product-grid-item');
            for (var product of productDetails) {
                const div_image = product.children[1];
                const div_vendor = product.children[2];
                const div_name = product.children[3];
                const div_price = product.children[4];

                if (div_vendor && div_name && div_price) {
                    const productRef = div_image.getAttribute('href');
                    let productTitle = div_vendor.innerText + ' ' + div_name.innerText;

                    productTitle = productTitle.split('"').join('');
                    productTitle = productTitle.replace(/'/g, '')
                    const productPrice = div_price.firstElementChild.innerText

                    products.push({ ref: productRef, title: productTitle, price: productPrice });
                }
            }

            return { products, bLastPage: btnPage[0] == undefined }
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
exports.scrap_bdgastore_jordan = scrap_bdgastore_jordan;
exports.bdgastore_jordan = bdgastore_jordan;