const puppeteer = require('puppeteer')

wishatl = async () => {
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
      `https://wishatl.com/collections/mens-sale?${page_index == 1 ? '' : 'page=' + page_index}`,
      { timeout: 0 },
    )
    const pageInfo = await page.evaluate(() => {
      let products = []
      let bLast = true
      let buttonNext = document.querySelector('#content #pagination > a > .fa-caret-right');
      if (buttonNext)
        bLast = false;
      const productDetails = document.querySelectorAll('#content #product-loop > .product-index');

      for (var product of productDetails) {

        let productRef = 'https://wishatl.com' + product.getAttribute('href')

        let productTitle = product.querySelector('.product-info > h4').innerText + ' ' + product.querySelector('.product-info > h3').innerText

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelector('.product-info > .price > .onsale').innerText

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
exports.default = wishatl
