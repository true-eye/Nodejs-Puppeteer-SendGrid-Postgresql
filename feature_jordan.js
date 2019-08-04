const puppeteer = require('puppeteer')

const autoScroll = require('./utils/index').autoScroll

feature_jordan = async () => {
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
      `https://feature.com/collections/sale-items/vendor_jordan`,
      { timeout: 0 },
    )

    await autoScroll(page);

    const pageInfo = await page.evaluate(() => {
      let products = []
      let bLast = true
      const productDetails = document.querySelectorAll('.product_item > .caption > a');

      for (var product of productDetails) {

        let productRef = 'https://feature.com' + product.getAttribute('href')

        let productTitle = product.firstElementChild.innerHTML

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelector('p > .price')
        productPrice = productPrice.innerText

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
exports.default = feature_jordan
