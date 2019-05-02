
const puppeteer = require('puppeteer');
var manageDBFile = require("./manageDBFile/index.js")
const fetch = require("node-fetch");

scrap_shelta = async (func_name) => {
    console.log(func_name, '   Start   ');
    let message = `<h2 style="background: white; color: red; text-align: center;">shelta.com</h2>`
    let ret = await manageDBFile.load_from_file("shelta.json").then(prevList => {
        return shelta().then((currentList) => {

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
            {
                manageDBFile.save_to_file("shelta.json", currentList)
                    .then(res => {
                        console.log(res)
                    }).catch(err => {
                        console.log(func_name, " saveToFile return error : ", err)
                    })
            }
            return message
        }).catch(err => {
            console.log(func_name, ' shelta return error : ', err)
            return null;
        });
    }).catch(err => {
        console.log(func_name, ' loadFromFile return error : ', err)
        return null;
    })
    return ret;
}

shelta = async () => {
    // Actual Scraping goes Here...

    let productList = [];

    let page_index = 1;

    while (1) {
        const response = await fetch(`https://shelta.eu/Services/Rest/v2/json/en-GB/EUR/categories/152/40/${page_index}/?priceListId=237810a5-7601-442f-bde7-422bd9ff7740`,
            {
                method: 'POST',
                headers: {
                    "Content-Type": 'text/plain'
                },
                body: `{"SearchTerm":null,"ListValues":{"subname":["Jordan","Nike","Nike Sportswear"]},"MultiLevelListValues":{},"SpanValues":{},"BoolValues":{"discounted":true},"OrderBy":null,"SortDirection":null}`
            }).then(res => res.json())
            .then(json => json)
            .catch(err => {
                console.log(err)
                return null
            })

        if (!response)
            break;

        const bLastPage = response.ProductsInPage != response.PageSize;
        const productItems = response.ProductItems.map(item => {
            const productRef = item.ProductUrl;
            let productTitle = item.Name;
            productTitle = productTitle.split('"').join('');
            productTitle = productTitle.replace(/'/g, '')
            const productPrice = item.Price;

            return { ref: productRef, title: productTitle, price: productPrice }
        })

        console.log(`---------Page ${page_index} ${bLastPage}---------`);

        productList = [...productList, ...productItems]

        if (bLastPage == true)
            break;
        page_index++;
    }

    //console.log(productList.length)

    return productList;
};
exports.scrap_shelta = scrap_shelta;
exports.shelta = shelta;