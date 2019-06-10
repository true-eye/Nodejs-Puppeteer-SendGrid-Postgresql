const puppeteer = require('puppeteer')

hanonshop = async () => {
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
      `https://www.hanon-shop.com/collections/clearance/brand_nike+cf-type-footwear?page=${page_index}&sort_by=created-descending`,
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnNextPage = document.querySelectorAll('.toolbar-container > .next')
      const productDetails = document.querySelectorAll(
        '.product-grid > .item .product-caption',
      )
      for (var product of productDetails) {
        const div_name = product.children[0]
        const div_price = product.children[1]
        if (div_name && div_price) {
          const productRef =
            'https://www.hanon-shop.com' +
            div_name.firstElementChild.getAttribute('href')
          let productTitle = div_name.firstElementChild.innerText

          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')

          if (
            productTitle.toUpperCase().includes('NIKE') ||
            productTitle.toUpperCase().includes('JORDAN')
          ) {
            const productPrice = div_price.firstElementChild.innerText
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
exports.default = hanonshop
