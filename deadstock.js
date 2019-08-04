const puppeteer = require('puppeteer')
deadstock = async () => {
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
      `https://www.deadstock.ca/collections/nike-sale?page=${page_index}`,
      { timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let btnPage = document.querySelector('.footer-page > .pagination > ul')
      let bLast = true
      if (btnPage) {
        let btnNext = btnPage.lastElementChild
        if (btnNext && !btnNext.classList.contains('active'))
          bLast = false
      }
      const productDetails = document.querySelectorAll('.grid-uniform > .grid__item > .grid-product__wrapper');
      for (var product of productDetails) {

        product = product.lastElementChild

        let productRef = product.getAttribute('href')

        let productTitle = product.querySelector('.grid-product__title').innerHTML

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelectorAll('.grid-product__price-wrap .money')
        productPrice = productPrice[productPrice.length - 1].innerHTML

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
exports.default = deadstock
