const puppeteer = require('puppeteer')

theoutnet = async () => {
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
      `https://www.theoutnet.com/en-us/shop/shoes/sneakers?cm_mmc=GoogleUS--TON_EN_USA--AM_USA_Generics--Generics_Shoes_Sneakers_BMM-_-p29794246731&device=c&gclid=Cj0KCQjwsvrpBRCsARIsAKBR_0I3aWXt4vtbI00hKYEcfY4ZFIvLLfNfS2WtcsAg6e5CxucQHJxIxjAaAhKCEALw_wcB&gclsrc=aw.ds&matchtype=b&tp=147662#{%22ytosQuery%22:%22true%22,%22linkdepartment%22:%22AM_Sneakers_SHOES%22,%22linkdepartmentId%22:%223074457345616680369%22,%22department%22:%22AM_Sneakers_SHOES%22,%22departmentId%22:%223074457345616680369%22,%22page%22:1,%22productsPerPage%22:%2296%22,%22suggestion%22:%22false%22,%22facetsvalue%22:[%22ads_f10001_ntk_cs:ADIDAS__2B__ORIGINALS__2B__by__2B__PHARRELL__2B__WILLIAMS%22,%22ads_f10001_ntk_cs:ADIDAS__2B__by__2B__STELLA__2B__McCARTNEY%22,%22ads_f10001_ntk_cs:RICK__2B__OWENS__2B__x__2B__ADIDAS%22],%22totalPages%22:%223%22,%22rsiUsed%22:%22false%22,%22totalItems%22:%22256%22,%22partialLoadedItems%22:%2296%22,%22itemsToLoadOnNextPage%22:%2296%22}`,
      { timeout: 0 },
    )

    const pageInfo = await page.evaluate(() => {
      let products = []
      let bLast = true
      const productDetails = document.querySelectorAll('.sr-product-list > .item > .wrapper > .itemLink');

      for (var product of productDetails) {

        let productRef = product.getAttribute('href')

        let productTitle = product.querySelector('.product-details > .designer-name').innerText + ' ' + product.querySelector('.product-details > .title').innerText

        productTitle = productTitle.split('"').join('')
        productTitle = productTitle.replace(/'/g, '')

        let productPrice = product.querySelector('.product-details > .pricing > .price > .discounted')
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
exports.default = theoutnet
