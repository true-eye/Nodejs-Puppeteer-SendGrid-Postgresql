const puppeteer = require('puppeteer')
renarts_women = async () => {
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

  while (1) {
    await page.goto(
      `https://renarts.com/collections/sale-styles/women's+footwear?page=${page_index}&sort_by=created-descending`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnPage = document.querySelectorAll('.pagination')
      let bLast = true
      if (btnPage) {
        let btnNext = btnPage[0]
        if (
          btnNext &&
          btnNext.lastElementChild &&
          !btnNext.lastElementChild.classList.contains('active')
        ) {
          bLast = false
        }
      }
      const productDetails = document.querySelectorAll('.product-thumbnail > a')
      for (var product of productDetails) {
        const div_name = product.children[0]
        const div_price = product.lastElementChild

        if (div_name && div_price) {
          const productRef =
            'https://renarts.com' + product.getAttribute('href')
          let productTitle = div_name.innerText

          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')

          if (
            productTitle.toUpperCase().includes('NIKE') ||
            productTitle.toUpperCase().includes('JORDAN')
          ) {
            const div_price_wrapper = div_price.children[1]
            if (div_price_wrapper) {
              const productPrice = div_price_wrapper.innerText
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
exports.default = renarts_women
