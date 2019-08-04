const puppeteer = require('puppeteer')
toddsnyder = async () => {
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
      `https://www.toddsnyder.com/collections/sale-shoes`,
      { timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let bLast = true
      const productDetails = document.querySelectorAll('.lemonade-products > .product > a');
      for (var product of productDetails) {

        let productRef = 'https://www.toddsnyder.com' + product.getAttribute('href')

        let productTitle = product.querySelector('.details > .h3').firstChild.nodeValue

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelector('.details > .h3 .money')
        productPrice = productPrice.innerHTML

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
exports.default = toddsnyder
