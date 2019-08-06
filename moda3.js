const puppeteer = require('puppeteer')

moda3 = async () => {
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
      `https://www.moda3.com/sale/shoes/${page_index == 1 ? '' : 'page' + page_index + '.html'}?brand=42966`,
      { timeout: 0 },
    )
    const pageInfo = await page.evaluate(() => {
      let products = []
      let bLast = true
      let buttonNext = document.querySelector('.collection-pagination .text-right > ul > .next');
      if (buttonNext)
        bLast = false;
      const productDetails = document.querySelectorAll('.product-block-holder > .product-block');

      for (var product of productDetails) {

        let productRef = product.querySelector('.title').getAttribute('href')

        let productTitle = product.querySelector('.title').innerText

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelector('.product-block-price').lastChild.nodeValue
        productPrice = productPrice.replace(/ /g, '')
        productPrice = productPrice.replace(/\n/g, '')

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
exports.default = moda3
