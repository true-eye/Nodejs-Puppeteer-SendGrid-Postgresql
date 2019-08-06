const puppeteer = require('puppeteer')

stylebop = async () => {
  // Actual Scraping goes Here...

  const chromeLaunchOptions = {
    // ignoreHTTPSErrors: true,
    headless: true,
    // timeout: 0,
    args: ['--disable-setuid-sandbox', '--no-sandbox'],
  }

  const browser = await puppeteer.launch(chromeLaunchOptions)
  const page = await browser.newPage()

  let productList = []

  let page_index = 1

  while (page_index <= 20) {
    await page.goto(
      `https://www.stylebop.com/en-us/men/sale/all-designers-a-z.html?designer=Nike`,
      { timeout: 0 },
    )
    const pageInfo = await page.evaluate(() => {
      let products = []
      let bLast = true
      const productDetails = document.querySelectorAll('#products-grid > .item > .product-info');

      for (var product of productDetails) {

        let productRef = product.querySelector('.product-info > .product-name > a').getAttribute('href')

        let productTitle = product.querySelector('.product-info > .product-designer').innerText + ' ' + product.querySelector('.product-info > .product-name').innerText

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelector('.product-info > .price-box > .special-price > .price').innerText

        products.push({
          ref: productRef,
          title: productTitle,
          price: productPrice,
        });
      }

      return { products, bLastPage: bLast }
    })

    console.log(
      `---------Page ${page_index} ${pageInfo.bLastPage}---------`,
      pageInfo.products.length,
    )

    productList = [...productList, ...pageInfo.products]

    break;
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = stylebop
