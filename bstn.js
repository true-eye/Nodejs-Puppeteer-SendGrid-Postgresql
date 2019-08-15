const puppeteer = require('puppeteer')
const recaptcha = require('./recaptcha')

bstn = async () => {
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

    await page.goto(
      `https://www.bstn.com/en/sale/filter/__brand_jordan.nike.nike-sb/page/${page_index}/sort/date_new`,
      { timeout: 0 },
    )

    const isCaptcha = await page.evaluate(() => {
      let gCaptcha = document.getElementById('challenge-form')
      //let gCaptcha = document.getElementsByTagName("body");
      return gCaptcha != null && gCaptcha.innerHTML != ''
    })

    console.log(isCaptcha)

    if (isCaptcha) {
      console.log('--Entering to Captcha Mode--')
      //const apiKey = "1a21be9ca8506169bd5b2a310457a8d0"
      const apiKey = '962808d9cfd77925df940b91ffa12ca5'

      const siteDetails = {
        sitekey: '6LfBixYUAAAAABhdHynFUIMA_sa4s-XsJvnjtgB0',
        pageurl:
          'https://www.bstn.com/en/sale8/filter/__brand_jordan.nike.nike-sb/page/1/sort/date_new',
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
      let btnPage = document.querySelectorAll(
        '.products_navigation > .right .next',
      )
      let bLast = true
      if (btnPage) {
        let btnNext = btnPage[0]
        if (btnNext && !btnNext.classList.contains('unavailable')) {
          bLast = false
        }
      }
      const productDetails = document.querySelectorAll(
        '.productlist > .item > .itemWrapper > .pText',
      )
      for (var product of productDetails) {
        const div_name = product.children[0]
        const div_price = product.children[1]

        if (div_name && div_price) {
          const productRef =
            'https://www.bstn.com' + div_name.getAttribute('href')
          let productTitle = div_name.getAttribute('title')

          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')

          if (
            productTitle.toUpperCase().includes('NIKE') ||
            productTitle.toUpperCase().includes('JORDAN')
          ) {
            const div_newprice = div_price.children[1]
            if (div_newprice) {
              const productPrice = div_newprice.innerText
              products.push({
                ref: productRef,
                title: productTitle,
                price: productPrice,
              })
            }
          }
        }
      }

      return { products, bLastPage: bLast }
    })

    console.log(
      `---------Page ${page_index} ${pageInfo.bLastPage}---------`,
      pageInfo.products.length,
    )

    productList = [...productList, ...pageInfo.products]

    if (pageInfo.bLastPage == true) break
    page_index++
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = bstn
