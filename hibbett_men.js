
const puppeteer = require('puppeteer');
var manageDBFile = require("./manageDBFile/index.js")


scrap_hibbett_men = async (func_name) => {
    console.log(func_name, '   Start   ');
    let message = `<h2 style="background: white; color: red; text-align: center;">hibbett_men.com</h2>`
    let ret = await manageDBFile.load_from_file("hibbett_men.json").then(prevList => {
        return hibbett_men().then((currentList) => {

            console.log(func_name, ' getCurrentProductList success : ', currentList.length);

            var changedFlag = false;


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

                            message += `<h4>Product Price Changed Ref:  ${curItem.ref}, Title: ${curItem.title}, Price: ${curItem.price}(origin: ${prevProduct.price})</h4><br/>`

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
                manageDBFile.save_to_file("hibbett_men.json", currentList)
                    .then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(func_name, " saveToFile return error : ", err)
                    })
            }
            return message
        }).catch(err => {
            console.log(func_name, ' hibbett_men return error : ', err)
            return null;
        });
    }).catch(err => {
        console.log(func_name, ' loadFromFile return error : ', err)
        return null;
    })
    return ret;
}

hibbett_men = async () => {
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
        await page.goto(`https://www.hibbett_men.com/collections/sale?page=${page_index}`, { waitUntil: 'domcontentloaded', timeout: 0 });

        const pageInfo = await page.evaluate(() => {
            let products = [];
            let btnNextPage = document.querySelectorAll('.pagination > .right');
            const productDetails = document.querySelectorAll('.product-grid > .product-item > .caption');
            for (var product of productDetails) {
                const div_name = product.children[0];
                const div_brand = product.children[1];
                const div_price = product.children[2];
                if (div_brand && div_name && div_price) {
                    const productVendor = div_brand.innerText;
                    if (productVendor.toUpperCase().includes('NIKE') || productVendor.toUpperCase().includes('JORDAN')) {
                        const productRef = "https://www.hibbett_men.com" + div_name.firstElementChild.getAttribute('href');
                        const productTitle = productVendor + " " + div_name.innerText;
                        const div_money = div_price.firstElementChild;
                        const productPrice = div_money != null ? div_money.innerText : div_price.innerHTML;
                        products.push({ ref: productRef, title: productTitle, price: productPrice });

                    }
                }
            }

            return { products, bLastPage: btnNextPage[0].classList.contains('unavailable') }
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
exports.scrap_hibbett_men = scrap_hibbett_men;
exports.hibbett_men = hibbett_men;