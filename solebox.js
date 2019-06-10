const puppeteer = require('puppeteer')

solebox = async () => {
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
    await page.goto(
      `https://www.solebox.com/en/Footwear/?ldtype=grid&_artperpage=96&pgNr=0&filter=f1%3AoJORDAN+%3Bf1%3AoNIKE+%3Bf6%3AoOnline%3Bf99%3AoSale`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )
    const pageInfo = await page.evaluate(() => {
      let products = []
      const productDetails = document.querySelectorAll(
        '#productList > .productData > a',
      )
      for (var product of productDetails) {
        const productRef = product.getAttribute('href')
        let productTitle = product.getAttribute('title')

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        const div_price = product.children[2]

        if (div_price) {
          const productPrice = div_price.innerText.split('€')[0] + '€'
          products.push({
            ref: productRef,
            title: productTitle,
            price: productPrice,
          })
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
exports.default = solebox
