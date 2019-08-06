const puppeteer = require('puppeteer')

socialstatuspgh_jordan = async () => {
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
      `https://www.socialstatuspgh.com/collections/sales/jordan?page=${page_index}`,
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnPage = document.querySelectorAll('#Collection > .pagination .btn')
      let bLast = true
      if (btnPage) {
        let btnNext = btnPage[1]
        if (btnNext && !btnNext.classList.contains('btn--disabled')) {
          bLast = false
        }
      }
      const productDetails = document.querySelectorAll(
        '.collection-products > .product > .product-card',
      )
      for (var product of productDetails) {
        const productRef =
          'https://www.socialstatuspgh.com' + product.getAttribute('href')
        const div_text = product.children[1]
        if (div_text) {
          const div_name = div_text.children[0]
          const div_price = div_text.children[1]
          if (div_name && div_price) {
            let productTitle = div_name.innerText

            productTitle = productTitle.split('"').join('')
            productTitle = productTitle.replace(/'/g, '')

            const productPrice = div_price.lastElementChild.innerText
            products.push({
              ref: productRef,
              title: productTitle,
              price: productPrice,
            })
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
exports.default = socialstatuspgh_jordan
