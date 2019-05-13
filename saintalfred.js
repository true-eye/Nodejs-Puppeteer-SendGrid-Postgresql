const puppeteer = require('puppeteer')

saintalfred = async () => {
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
      `https://www.saintalfred.com/collections/sale?page=${page_index}`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnNextPage = document.querySelectorAll(
        '.pagination > .pagination-next a',
      )
      const productDetails = document.querySelectorAll(
        '.collection-products > .product-list-item > .product-list-item-details',
      )
      for (var product of productDetails) {
        const div_item_vendor = product.children[0]
        const div_item_title = product.children[1]
        const div_item_price = product.children[2]

        if (div_item_vendor && div_item_title && div_item_price) {
          const productVendor = div_item_vendor.innerText
          if (
            productVendor.toUpperCase().includes('NIKE') ||
            productVendor.toUpperCase().includes('JORDAN')
          ) {
            const productRef =
              'https://www.saintalfred.com' +
              div_item_title.firstElementChild.getAttribute('href')
            let productTitle = productVendor + ' ' + div_item_title.innerText
            productTitle = productTitle.split('"').join('')
            productTitle = productTitle.replace(/'/g, '')
            const productPrice =
              div_item_price.firstElementChild.firstElementChild.innerText
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

    console.log(`---------Page ${page_index} ${pageInfo.bLastPage}---------`)

    productList = [...productList, ...pageInfo.products]

    if (pageInfo.bLastPage == true) break
    page_index++
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = saintalfred
