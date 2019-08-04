const puppeteer = require('puppeteer')
const recaptcha = require('./recaptcha')

urbanoutfitters = async () => {
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

  // await page.setUserAgent(
  //   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  // )

  while (page_index <= 20) {
    await page.goto(
      `https://www.urbanoutfitters.com/mens-shoes-on-sale?brand=New+Balance,Nike,adidas`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )

    const isCaptcha = await page.evaluate(() => {
      //let gCaptcha = document.getElementById('challenge-form')
      let gCaptcha = document.getElementsByTagName("body");
      return gCaptcha.innerHTML
      return gCaptcha != null && gCaptcha.innerHTML != ''
    })

    console.log(isCaptcha)
    if (isCaptcha) {
      console.log('--Entering to Captcha Mode--')
      //const apiKey = "1a21be9ca8506169bd5b2a310457a8d0"
      const apiKey = '962808d9cfd77925df940b91ffa12ca5'

      const siteDetails = {
        sitekey: '',
        pageurl:
          'https://www.urbanoutfitters.com/mens-shoes-on-sale?brand=New+Balance,Nike,adidas',
      }

      const requestId = await recaptcha.initiateCaptchaRequest(
        apiKey,
        siteDetails,
      )

      const response = await recaptcha.pollForRequestResults(apiKey, requestId)

      await page.evaluate(
        `document.getElementById("g-recaptcha-response").innerHTML="${response}";`,
      )

      await Promise.all([
        page.evaluate('document.getElementById("challenge-form").submit();'),
        page.waitForNavigation(),
      ])
    }

    const pageInfo = await page.evaluate(() => {
      let products = []
      let bLast = true
      const productDetails = document.querySelectorAll('.s-category-grid > .c-product-tile .c-product-tile-details');
      for (var product of productDetails) {

        let productRef = 'https://www.urbanoutfitters.com' + product.querySelector('.c-product-tile__title-link').getAttribute('href')

        let productTitle = product.querySelector('.c-product-tile__title-link').innerText

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelector('.c-product-tile__price .c-product-meta__current-price')
        productPrice = productPrice.innerHTML

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
exports.default = urbanoutfitters
