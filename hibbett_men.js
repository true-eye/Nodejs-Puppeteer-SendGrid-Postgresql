const puppeteer = require('puppeteer')

var randomUseragent = require('random-useragent')
const request = require('request-promise-native')
const poll = require('promise-poller').default

hibbett_men = async () => {
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

  while (page_index <= 400) {
    await page.goto(
      `https://www.hibbett.com/clearance/men/shoes/?sz=24&start=${page_index}`,
      { waitUntil: 'domcontentloaded', timeout: 0 },
    )

    const isCaptcha = await page.evaluate(() => {
      let gCaptcha = document.getElementById('g-recaptcha-response')
      //let gCaptcha = document.getElementsByTagName("body");
      return gCaptcha != null
    })

    console.log(isCaptcha)

    let pageInfo

    if (isCaptcha) {
      console.log('--Entering to Captcha Mode--')

      const apiKey = '962808d9cfd77925df940b91ffa12ca5'

      const requestId = await initiateCaptchaRequest(apiKey)

      const response = await pollForRequestResults(apiKey, requestId)

      await page.evaluate(
        `document.getElementById("g-recaptcha-response").innerHTML="${response}";`,
      )

      //await Promise.all([page.evaluate('document.getElementById("challenge-form").submit();'), page.waitForNavigation()]);
    }
    pageInfo = await page.evaluate(() => {
      let products = []
      let btnNextPage = document.querySelectorAll(
        '.infinite-scroll-placeholder > .view-more-btn',
      )
      const productDetails = document.querySelectorAll(
        '.grid-tile > .product-tile > .product-tile-background > .product-tile-bottom',
      )
      for (var product of productDetails) {
        const div_name = product.children[1]
        const div_price = product.children[2]
        if (div_name && div_price) {
          let productTitle = div_name.innerText
          productTitle = productTitle.split('"').join('')
          productTitle = productTitle.replace(/'/g, '')
          if (
            productTitle.toUpperCase().includes('NIKE') ||
            productTitle.toUpperCase().includes('JORDAN')
          ) {
            const productRef = div_name.firstElementChild.getAttribute('href')
            const div_money = div_price.lastElementChild
            const productPrice = div_money.innerText.split('$')[1]
            products.push({
              ref: productRef,
              title: productTitle,
              price: productPrice,
            })
          }
        }
      }

      return { products, bLastPage: btnNextPage[0] == undefined }
    })

    console.log(`---------Page ${page_index} ${pageInfo.bLastPage}---------`)

    productList = [...productList, ...pageInfo.products]

    if (pageInfo.bLastPage == true) break
    page_index += 24
  }

  //console.log(productList.length)

  browser.close()
  return productList
}
exports.default = hibbett_men

const siteDetails = {
  sitekey: '6Lcj-R8TAAAAABs3FrRPuQhLMbp5QrHsHufzLf7b',
  pageurl: 'https://www.hibbett.com/clearance/men/shoes/',
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
  return async function() {
    return new Promise(async function(resolve, reject) {
      const rawResponse = await request.get(url)
      const resp = JSON.parse(rawResponse)
      if (resp.status === 0) return reject(resp.request)
      resolve(resp.request)
    })
  }
}

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))
