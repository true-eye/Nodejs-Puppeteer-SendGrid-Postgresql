const puppeteer = require('puppeteer')

packershoes_nike = async () => {
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
      `https://packershoes.com/collections/sale/nike+mens?page=${page_index}`,
      { timeout: 0 },
    )
    const pageInfo = await page.evaluate(() => {
      let products = []
      let bLast = true
      let buttonNext = document.querySelector('.shopify-section > .pagination > .next');
      if (buttonNext)
        bLast = false;
      const productDetails = document.querySelectorAll('#grid-filter-toggle > .grid-product > .grid-product__wrapper > a');

      for (var product of productDetails) {

        let productRef = 'https://packershoes.com' + product.getAttribute('href')

        let productTitle = product.querySelector('.grid-product__title').innerText

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelector('.grid-product__price-wrap > .grid-product__price > .money').innerText

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

    if (pageInfo.bLastPage)
      break;
    page_index++;
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = packershoes_nike
