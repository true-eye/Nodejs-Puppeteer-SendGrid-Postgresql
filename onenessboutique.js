const puppeteer = require('puppeteer')

onenessboutique = async () => {
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
      `https://www.onenessboutique.com/collections/sale?page=${page_index}`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnNextPage = document.querySelectorAll('.paginate .next')
      const productDetails = document.querySelectorAll(
        '.product-wrap > a > .product-details',
      )
      for (var product of productDetails) {
        if (
          product.firstElementChild &&
          product.lastElementChild &&
          product.lastElementChild.firstElementChild
        ) {
          if (product.parentElement) {
            const productRef = product.parentElement.getAttribute('href')
            let productTitle = product.firstElementChild.innerHTML
            productTitle = productTitle.split('"').join('')
            productTitle = productTitle.replace(/'/g, '')
            const productPrice =
              product.lastElementChild.firstElementChild.innerHTML

            if (
              productTitle.toUpperCase().includes('NIKE') ||
              productTitle.toUpperCase().includes('JORDAN')
            )
              products.push({
                ref: 'https://www.onenessboutique.com' + productRef,
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
exports.default = onenessboutique
