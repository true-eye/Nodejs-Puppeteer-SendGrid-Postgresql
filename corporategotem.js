const puppeteer = require('puppeteer')

corporategotem = async () => {
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
    let category = page_index == 1 ? 'Nike' : 'Jordan'
    await page.goto(
      `http://corporategotem.com/products.cfm?Start=17&viewall=1&SortBy=Newest&CatID=sale&Brand=${category}&Size=Show%20All%20Sizes`,
      { timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      const productDetails = document.querySelectorAll(
        '#product-listing-main a',
      )
      for (var product of productDetails) {
        const productRef = product.getAttribute('href')
        let productTitle = product.getAttribute('title')
        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        const div_description = product.children[1]
        if (div_description) {
          const div_price = div_description.lastElementChild
          if (div_price) {
            let productPrice = div_price.innerText
            productPrice = productPrice.split(' ')[0]

            products.push({
              ref: productRef,
              title: productTitle,
              price: productPrice,
            })
          }
        }
      }

      return { products, bLastPage: false }
    })

    console.log(
      `---------Page ${page_index} ${pageInfo.bLastPage}---------`,
      pageInfo.products.length,
    )

    productList = [...productList, ...pageInfo.products]

    if (page_index >= 2) break
    page_index++
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = corporategotem
