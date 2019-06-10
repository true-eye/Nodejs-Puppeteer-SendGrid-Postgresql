const puppeteer = require('puppeteer')
centre214 = async () => {
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
      `https://centre214.com/collections/sale-1?page=${page_index}`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnPage = document.querySelectorAll('.pagination > .right')
      let bLast = true
      if (btnPage) {
        let btnNext = btnPage[0]
        if (btnNext && !btnNext.classList.contains('unavailable')) {
          bLast = false
        }
      }
      const productDetails = document.querySelectorAll(
        '.product--root > .product--details',
      )
      for (var product of productDetails) {
        const div_name = product.children[0]
        const div_price = product.children[1]

        if (div_name && div_price) {
          const productRef =
            'https://centre214.com' + div_name.getAttribute('href')
          let productTitle = div_name.innerText

          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')

          if (
            productTitle.toUpperCase().includes('NIKE') ||
            productTitle.toUpperCase().includes('JORDAN')
          ) {
            const div_price_wrapper = div_price.firstElementChild
            if (div_price_wrapper) {
              const productPrice = div_price_wrapper.lastElementChild.innerText
              products.push({
                ref: productRef,
                title: productTitle,
                price: productPrice,
              })
            }
          }
        }
      }

      return { products, bLastPage: bLast }
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
exports.default = centre214
