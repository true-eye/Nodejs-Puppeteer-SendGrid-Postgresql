const puppeteer = require('puppeteer')
nordstromrack = async () => {
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
      `https://www.nordstromrack.com/shop/Women/Shoes/Sneakers?brands%5B%5D=Nike&page=${page_index}&sort=featured`,
      { timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnPage = document.querySelectorAll('.catalog-page__pagination > .pagination > .pagination__item--next')
      let bLast = true
      if (btnPage) {
        let btnNext = btnPage[0]
        if (btnNext != undefined)
          bLast = false
      }
      const productDetails = document.querySelectorAll('.product-grid > .product-grid__row > .product-grid-item');
      for (var product of productDetails) {

        let productRef = 'https://www.nordstromrack.com' + product.getAttribute('href')

        let productTitle = product.querySelector('.product-grid-item__details > .product-grid-item__title').innerHTML

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelector('.product-grid-item__details .product-grid-item__sale-price')
        if (!productPrice)
          productPrice = product.querySelector('.product-grid-item__details .product-grid-item__pricing--in-cart').innerHTML
        else
          productPrice = productPrice.innerHTML

        products.push({
          ref: productRef,
          title: productTitle,
          price: productPrice,
        });
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
exports.default = nordstromrack
