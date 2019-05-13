const puppeteer = require('puppeteer')
sneakersnstuff = async () => {
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
      `https://www.sneakersnstuff.com/en/56/sale/${page_index}?p=5954&p=2412&p=1046&p=750865&p=765746&p=750882&p=750886&p=759435&p=750920&p=750958&p=750938&p=830693&p=819032&p=760609&p=815795&p=846096&p=822236&p=766086&p=750899&p=738762&p=786078&p=791858&p=817960&p=822212&p=789701&p=792955&p=797503&p=827973&p=757442&p=750934&p=871129&p=847046&p=406887&orderBy=Published`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnPage = document.querySelectorAll('.pagination > .pagination__next')
      let bLast = true
      if (btnPage) {
        let btnNext = btnPage[0]
        if (btnNext && !btnNext.classList.contains('is-disabled')) {
          bLast = false
        }
      }
      const productDetails = document.querySelectorAll(
        '.product-list > article > .card__content',
      )
      for (var product of productDetails) {
        const div_name = product.children[0]
        const div_price = product.children[1]

        if (div_name && div_price) {
          const productRef =
            'https://www.sneakersnstuff.com' +
            div_name.firstElementChild.getAttribute('href')
          let productTitle = div_name.innerText

          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')

          if (
            productTitle.toUpperCase().includes('NIKE') ||
            productTitle.toUpperCase().includes('JORDAN')
          ) {
            const div_price_wrapper = div_price.lastElementChild
            if (div_price_wrapper) {
              const productPrice = div_price_wrapper.children[1].innerText
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
exports.default = sneakersnstuff
