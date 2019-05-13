const puppeteer = require('puppeteer')

overkillshop = async () => {
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
      `https://www.overkillshop.com/en/sale.html?limit=50&manufacturer=445%2C5%2C841&p=${page_index}`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnNextPage = document.querySelectorAll('.pagination .next')
      const productDetails = document.querySelectorAll(
        '.products-grid > .item > .thumbnail > .caption',
      )
      for (var product of productDetails) {
        const div_href = product.children[0]
        const div_price_box = product.children[2]

        if (div_href && div_price_box) {
          const productRef = div_href.getAttribute('href')
          let productTitle = div_href.getAttribute('title')
          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')
          const div_special_price = div_price_box.children[0]
          if (div_special_price) {
            const productPrice = div_special_price.firstElementChild.innerText
            products.push({
              ref: productRef,
              title: productTitle,
              price: productPrice,
            })
          }
        }
      }

      return { products, bLastPage: btnNextPage[0] == undefined }
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
exports.default = overkillshop
