const puppeteer = require('puppeteer')

sneakerpolitics = async () => {
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
      `https://sneakerpolitics.com/collections/sale?page=${page_index}`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnNextPage = document.querySelectorAll('.paginate .next a')
      const productDetails = document.querySelectorAll(
        '.twelve > .thumbnail > a',
      )
      for (var product of productDetails) {
        const productRef =
          'https://sneakerpolitics.com' + product.getAttribute('href')
        let productTitle = product.getAttribute('title')

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        if (
          productTitle.toUpperCase().includes('NIKE') ||
          productTitle.toUpperCase().includes('JORDAN')
        ) {
          const div_info = product.children[1]
          if (div_info) {
            const div_price = div_info.children[1]

            if (div_price) {
              const productPrice = div_price.innerText.split(' ')[0]

              products.push({
                ref: productRef,
                title: productTitle,
                price: productPrice,
              })
            }
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
exports.default = sneakerpolitics
