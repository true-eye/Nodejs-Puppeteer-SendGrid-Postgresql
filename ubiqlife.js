const puppeteer = require('puppeteer')
ubiqlife = async () => {
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

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  )

  while (page_index <= 20) {
    await page.goto(`https://www.ubiqlife.com/sale/brands/jordan-nike.html`, {
      waitUntil: 'domcontentloaded',
      timeout: 0,
    })

    const pageInfo = await page.evaluate(() => {
      let products = []
      /*
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
      }*/
      const productDetails = document.querySelectorAll(
        '.products-grid > .item > .product-info',
      )
      for (var product of productDetails) {
        const div_name = product.children[1]
        const div_price = product.children[2]

        if (div_name && div_price) {
          const productRef = div_name.firstElementChild.getAttribute('href')
          let productTitle = div_name.firstElementChild.getAttribute('title')

          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')

          const div_price_wrapper = div_price.children[1]
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

      return { products, bLastPage: true }
    })

    console.log(
      `---------Page ${page_index} ${pageInfo.bLastPage}---------`,
      pageInfo.products.length,
    )

    productList = [...productList, ...pageInfo.products]

    //if (pageInfo.bLastPage == true)
    break
    page_index++
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = ubiqlife
