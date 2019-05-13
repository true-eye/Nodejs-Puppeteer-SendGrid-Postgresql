const puppeteer = require('puppeteer')

finishline_men = async () => {
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
    await page.goto(`http://www.finishline.com`)

    const pageInfo = await page.evaluate(() => {
      let products = []
      //let btnNextPage = document.querySelectorAll('.paginate .next');
      return { products: document.innerHTML, bLastPage: true }
      const productDetails = document.querySelectorAll(
        '.product-card > .product-card__details',
      )
      for (var product of productDetails) {
        if (
          product.firstElementChild &&
          product.firstElementChild.nextElementSibling
        ) {
          var element = product.firstElementChild.nextElementSibling

          if (
            element.firstElementChild &&
            element.nextElementSibling &&
            element.nextElementSibling.lastElementChild
          ) {
            const productRef = element.getAttribute('href')
            let productTitle = element.firstElementChild.innerHTML

            productTitle = productTitle.split('"').join('')
            productTitle = productTitle.replace(/'/g, '')

            element = element.nextElementSibling
            const productPrice = element.lastElementChild.innerHTML
            products.push({
              ref: productRef,
              title: productTitle,
              price: productPrice,
            })
          } else {
            console.log('finishline_men error occured')
          }
        } else {
          console.log('finishline_men error occured')
        }
      }

      return { products, bLastPage: true }
    })

    console.log(
      `---------Page ${page_index} ${pageInfo.bLastPage}---------`,
      pageInfo,
    )

    productList = [...productList, ...pageInfo.products]

    //if (pageInfo.bLastPage == true)
    break
    page_index++
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = finishline_men
