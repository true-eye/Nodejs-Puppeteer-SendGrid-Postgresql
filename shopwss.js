const puppeteer = require('puppeteer')

shopwss = async () => {
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
      `https://www.shopwss.com/category/dept/on-sale?sort=desc_salesTotal&filters=Brand_FILTER:JORDAN,NIKE!Gender_FILTER:Mens!Hierarchy_TOP_NAVIGATION_FILTER:/TOP_NAVIGATION/wc_dept_on-sale!Product_Type_FILTER:Shoes!sizes_FILTER_LANG_en`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )
    const pageInfo = await page.evaluate(() => {
      let products = []
      const productDetails = document.querySelectorAll(
        '.product-list > .product-list__item > .c-product-card > .c-product-card__info',
      )
      for (var product of productDetails) {
        const div_name = product.getElementsByClassName(
          'c-product-card__title',
        )[0]
        const div_price = product.getElementsByClassName(
          'c-product-card__price',
        )[0]

        if (div_name && div_price) {
          const productRef =
            'https://www.shopwss.com' +
            div_name.firstElementChild.getAttribute('href')
          let productTitle = div_name.innerText

          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')

          const div_sale = div_price.children[1]
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
exports.default = shopwss
