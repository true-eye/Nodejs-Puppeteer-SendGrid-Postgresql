const puppeteer = require('puppeteer')

rsvpgallery = async () => {
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

  let page_index = 0

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  )

  while (page_index <= 20) {
    await page.goto(`https://rsvpgallery.com/collections/converse`)
    const pageInfo = await page.evaluate(() => {
      let products = []
      const productDetails = document.querySelectorAll(
        '.product > .product-details',
      )
      for (var product of productDetails) {
        const div_name = product.children[0]
        const div_price = product.children[1]

        if (div_name && div_price) {
          const productRef =
            'https://rsvpgallery.com' + div_name.getAttribute('href')
          let productTitle = div_name.lastElementChild.innerText

          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')

          const div_sale = div_price.firstElementChild
          if (div_sale) {
            const productPrice = div_sale.innerText
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
    page_index += 24
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = rsvpgallery
