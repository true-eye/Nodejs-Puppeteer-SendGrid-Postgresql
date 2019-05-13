const puppeteer = require('puppeteer')
undefeat_jordan = async () => {
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
      `https://undefeated.com/collections/sale/mens-footwear+jordan?page=${page_index}`,
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      const productDetails = document.querySelectorAll(
        '.product-grid-item > .product-content > .quick-shop-button > .pc-inner',
      )

      for (var product of productDetails) {
        const div_name = product.firstElementChild.firstElementChild
        const div_price = product.children[1]

        if (div_name && div_price) {
          const productRef =
            'https://undefeat.com' +
            div_name.firstElementChild.getAttribute('href')
          let productTitle = div_name.firstElementChild.innerHTML

          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')

          const div_price_wrapper = div_price.lastElementChild
          if (div_price_wrapper) {
            const productPrice = div_price_wrapper.firstElementChild.innerHTML
            products.push({
              ref: productRef,
              title: productTitle,
              price: productPrice,
            })
          }
        }
      }

      return { products, bLastPage: products.length == 0 }
    })

    console.log(
      `---------Page ${page_index} ${pageInfo.bLastPage}---------`,
      pageInfo.products.length,
    )

    productList = [...productList, ...pageInfo.products]

    if (pageInfo.bLastPage == true) break
    page_index++
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = undefeat_jordan
