const puppeteer = require('puppeteer')
var manageDBFile = require('./manageDBFile/index.js')
const fetch = require('node-fetch')

shelta = async () => {
  // Actual Scraping goes Here...

  let productList = []

  let page_index = 1

  while (page_index <= 20) {
    const response = await fetch(
      `https://shelta.eu/Services/Rest/v2/json/en-GB/EUR/categories/152/40/${page_index}/?priceListId=237810a5-7601-442f-bde7-422bd9ff7740`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: `{"SearchTerm":null,"ListValues":{"subname":["Jordan","Nike","Nike Sportswear"]},"MultiLevelListValues":{},"SpanValues":{},"BoolValues":{"discounted":true},"OrderBy":null,"SortDirection":null}`,
      },
    )
      .then(res => res.json())
      .then(json => json)
      .catch(err => {
        console.log(err)
        return null
      })

    if (!response) break

    const bLastPage = response.ProductsInPage != response.PageSize
    const productItems = response.ProductItems.map(item => {
      const productRef = item.ProductUrl
      let productTitle = item.Name
      productTitle = productTitle.split('"').join('')
      productTitle = productTitle.replace(/'/g, '')
      const productPrice = item.Price

      return { ref: productRef, title: productTitle, price: productPrice }
    })

    console.log(`---------Page ${page_index} ${bLastPage}---------`)

    productList = [...productList, ...productItems]

    if (bLastPage == true) break
    page_index++
  }

  //console.log(productList.length)

  return productList
}
exports.default = shelta
