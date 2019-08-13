const puppeteer = require('puppeteer')

var randomUseragent = require('random-useragent')
const request = require('request-promise-native')
const poll = require('promise-poller').default

sotostore = async () => {
  // Actual Scraping goes Here...

  const chromeLaunchOptions = {
    // ignoreHTTPSErrors: true,
    headless: true,
    // timeout: 0,
    args: ['--disable-setuid-sandbox', '--no-sandbox'],
  }

  const browser = await puppeteer.launch(chromeLaunchOptions)
  const page = await browser.newPage()
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  )
  let productList = []

  let page_index = 1

  while (page_index <= 20) {
    await page.goto(
      `https://www.sotostore.com/en/151/footwear/${page_index}?p=2189&p=21364&p=40456&orderBy=Published`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )

    const isCaptcha = await page.evaluate(() => {
      let gCaptcha = document.getElementById("challenge-form");
      // let gCaptcha = document.getElementsByTagName('body')[0].innerHTML
      return gCaptcha != null
    })

    console.log(isCaptcha)

    await page.waitFor(4000)

    if (isCaptcha) {
      console.log('--Entering to Captcha Mode--')
      const apiKey = '962808d9cfd77925df940b91ffa12ca5'

      const requestId = await initiateCaptchaRequest(apiKey)

      const response = await pollForRequestResults(apiKey, requestId)

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
      let btnNextPage = document.querySelectorAll(
        '.pagination-buttons > .next-page-control',
      )
      const productDetails = document.querySelectorAll(
        '.product-list > .card > .card-content',
      )
      for (var product of productDetails) {
        const div_brand = product.children[0]
        const div_name = product.children[1]
        const div_price = product.children[2]
        if (div_brand && div_name && div_price) {
          const productVendor = div_brand.innerText
          if (
            productVendor.toUpperCase().includes('NIKE') ||
            productVendor.toUpperCase().includes('JORDAN')
          ) {
            const productRef =
              'https://www.sotostore.com' + product.getAttribute('href')
            let productTitle = productVendor + ' ' + div_name.innerText

            productTitle = productTitle.split('"').join('')
            productTitle = productTitle.replace(/'/g, '')
            const productPrice =
              div_price.lastElementChild.children[1].innerText
            products.push({
              ref: productRef,
              title: productTitle,
              price: productPrice,
            })
          }
        }
      }

      let bLast = true
      if (btnNextPage && btnNextPage[0] && !btnNextPage[0].classList.contains('is-disabled'))
        bLast = false

      return {
        products,
        bLastPage: bLast
      }
    })

    console.log(`---------Page ${page_index} ${pageInfo.bLastPage}---------`)

    productList = [...productList, ...pageInfo.products]

    if (pageInfo.bLastPage == true) break
    page_index++
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = sotostore

const siteDetails = {
  sitekey: '6LfBixYUAAAAABhdHynFUIMA_sa4s-XsJvnjtgB0',
  pageurl: 'https://www.sotostore.com/en/151/footwear/1?p=2189&p=21364&p=40456&orderBy=Published',
}

async function initiateCaptchaRequest(apiKey) {
  const formData = {
    method: 'userrecaptcha',
    googlekey: siteDetails.sitekey,
    key: apiKey,
    pageurl: siteDetails.pageurl,
    json: 1,
  }
  const response = await request.post('http://2captcha.com/in.php', {
    form: formData,
  })
  return JSON.parse(response).request
}

async function pollForRequestResults(
  key,
  id,
  retries = 30,
  interval = 1500,
  delay = 15000,
) {
  await timeout(delay)
  return poll({
    taskFn: requestCaptchaResults(key, id),
    interval,
    retries,
  })
}

function requestCaptchaResults(apiKey, requestId) {
  const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`
  return async function () {
    return new Promise(async function (resolve, reject) {
      const rawResponse = await request.get(url)
      const resp = JSON.parse(rawResponse)
      if (resp.status === 0) return reject(resp.request)
      resolve(resp.request)
    })
  }
}
const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))
