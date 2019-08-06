const puppeteer = require('puppeteer')

revolve = async () => {
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
      `https://www.revolve.com/sale/shoes-sneakers/br/fd097e/?navsrc=left&designer%5B%5D=adidas+by+Stella+McCartney&designer%5B%5D=adidas+Originals&designer%5B%5D=DRKSHDW+by+Rick+Owens&designer%5B%5D=Vans&filters=designer`,
      { timeout: 0 },
    )
    const pageInfo = await page.evaluate(() => {
      let products = []
      let bLast = true
      const productDetails = document.querySelectorAll('.products-grid > .item > .plp_image_wrap > a');

      for (var product of productDetails) {

        let productRef = 'https://www.revolve.com' + product.getAttribute('href')

        let productTitle = product.querySelector('.product-name').innerText + ' ' + product.querySelector('.product-brand').innerText

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelector('.price > .price__sale')
        productPrice = productPrice.innerText

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

    break;
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = revolve
