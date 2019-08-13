//const cron = require("node-cron");
const express = require('express')
let nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport')
var path = require('path')

var manageDBFile = require('./manageDBFile/index.js')
var module_onenessboutique = require('./onenessboutique.js')
var module_citygear = require('./citygear.js')
var module_jimmyjazz = require('./jimmyjazz.js')

var module_jimmyjazz_men = require('./jimmyjazz_men')
var module_jimmyjazz_women = require('./jimmyjazz_women')
var module_jimmyjazz_grade = require('./jimmyjazz_grade')

var module_kickz = require('./kickz.js')
//var module_shelta = require('./shelta')
var module_sneakerpolitics = require('./sneakerpolitics')
var module_overkillshop = require('./overkillshop')
var module_ycmc = require('./ycmc')
var module_ycmc_men_jordan = require('./ycmc_men_jordan')
var module_ycmc_men_nike = require('./ycmc_men_nike')
var module_ycmc_women_jordan = require('./ycmc_women_jordan')
var module_ycmc_kids_jordan = require('./ycmc_kids_jordan')
var module_ycmc_kids_nike = require('./ycmc_kids_nike')
var module_asphaltgold = require('./asphaltgold')
var module_notreshop = require('./notre-shop')
var module_hanonshop = require('./hanonshop')
var module_sotostore = require('./sotostore')
var module_lapstoneandhammer = require('./lapstoneandhammer')
//var module_hibbett_men = require("./hibbett_men")
var module_kicksusa_men = require('./kicksusa_men')
var module_kicksusa_women = require('./kicksusa_women')
var module_kicksusa_kids = require('./kicksusa_kids')
var module_endclothing = require('./endclothing')
var module_corporategotem = require('./corporategotem')
var module_socialstatuspgh = require('./socialstatuspgh')
var module_bstn = require('./bstn')
var module_bdgastore_balance = require('./bdgastore_balance')
var module_bdgastore_jordan = require('./bdgastore_jordan')
var module_bdgastore_nike = require('./bdgastore_nike')
var module_centre214 = require('./centre214')
var module_footpatrol = require('./footpatrol')
var module_rsvpgallery = require('./rsvpgallery')
var module_rsvpgallery_nike = require('./rsvpgallery_nike')
var module_shopwss = require('./shopwss')
var module_solebox = require('./solebox')
var module_undefeat = require('./undefeat')
var module_undefeat_nike = require('./undefeat_nike')
var module_undefeat_jordan = require('./undefeat_jordan')
var module_sneakersnstuff = require('./sneakersnstuff')
var module_saintalfred = require('./saintalfred')
var module_finishline_men = require('./finishline_men')
var module_renarts_men = require('./renarts_men')
var module_renarts_women = require('./renarts_women')
var module_ubiqlife = require('./ubiqlife')
var module_nordstromrack_women = require('./nordstromrack_women')
var module_nordstromrack_men = require('./nordstromrack_men')
var module_toddsnyder = require('./toddsnyder');
var module_deadstock = require('./deadstock');
var module_urbanoutfitters = require('./urbanoutfitters')
var module_feature_jordan = require('./feature_jordan')
var module_feature_nike = require('./feature_nike')
var module_theoutnet = require('./theoutnet');
var module_revolve = require('./revolve')
var module_moda3 = require('./moda3')
var module_wishatl = require('./wishatl')
var module_socialstatuspgh_adidas = require('./socialstatuspgh_adidas')
var module_socialstatuspgh_jordan = require('./socialstatuspgh_jordan')
var module_packershoes_nike = require('./packershoes_nike')
var module_packershoes_jordan = require('./packershoes_jordan')
var module_stylebop = require('./stylebop')

var developer_mode = require('./manageDBFile/index').developer_mode
var test_deploy_mode = require('./manageDBFile/index').test_deploy_mode

app = express()

//create mail transporter
/*
var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: 'arkamixkicks@gmail.com',
        pass: 'Vin234az$'
    }
}));

var transporter2 = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: 'arkamixkicks@gmail.com',
        pass: 'Vin234az$'
    }
}));*/

scrap = async (sitename, detail_func) => {
  let func_name = 'scrap_' + sitename
  console.log(func_name, '   Start   ')
  let message = `<tr><td colspan="5" class="sitename">${sitename}</td></tr>`
  let ret = await manageDBFile
    .load_from_file(`${sitename}.json`)
    .then(prevList => {
      return detail_func()
        .then(currentList => {
          console.log(
            func_name,
            ' getCurrentProductList success : ',
            currentList.length,
          )

          var changedFlag = false

          if (prevList.length > 0) {
            let count = 1
            for (let i in currentList) {
              const curItem = currentList[i]
              const productsWithSameTitle = prevList.filter(
                item => item.title == curItem.title && item.ref == curItem.ref,
              )

              if (productsWithSameTitle.length == 0) {
                // curItem is a new item
                console.log(
                  `******* ${func_name} new item launched ******`,
                  curItem,
                )

                message += `<tr>
                                        <td>${count}</td>
                                        <td>New Product Launched</td>
                                        <td><a href="${curItem.ref}">${
                  curItem.ref
                  }</a></td>
                                        <td>${curItem.title}</td>
                                        <td>${curItem.price}</td>
                                    </tr>`

                changedFlag = true
                count++
              } else {
                const prevProduct = productsWithSameTitle[0]
                if (curItem.price != prevProduct.price) {
                  console.log(
                    `------ ${func_name} product price changed ------`,
                    curItem,
                    '::: prev price ::: ',
                    prevProduct.price,
                  )

                  message += `<tr>
                                        <td>${count}</td>
                                        <td>Price Changed</td>
                                        <td><a href="${curItem.ref}">${
                    curItem.ref
                    }</a></td>
                                        <td>${curItem.title}</td>
                                        <td>${curItem.price}</td>
                                    </tr>`

                  changedFlag = true
                  count++
                }
              }
            }
          }

          if (changedFlag == false) {
            console.log(func_name, ' no changes')
            message += `<tr><td colspan="5">No Changes</td>`
          }

          // save changed product list
          //if (prevList.length == 0 || changedFlag == true)
          if (!developer_mode) {
            manageDBFile
              .save_to_file(`${sitename}.json`, currentList)
              .then(res => {
                console.log(res)
              })
              .catch(err => {
                console.log(func_name, ' saveToFile return error : ', err)
              })
          }
          return message
        })
        .catch(err => {
          console.log(func_name, ` ${sitename} return error : `, err)
          return null
        })
    })
    .catch(err => {
      console.log(func_name, ' loadFromFile return error : ', err)
      return null
    })
  return ret
}

let allWebsites = async () => {
  let message = `<html>

    <head>
        <style>
            table {
                width: 100%;
                font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
                border-collapse: collapse;
            }
    
            td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center
            }
    
            .sitename {
                background-color: #4CAF50;
                color: white;
            }
    
            th {
                border: 1px solid #ddd;
                padding: 8px;
                background-color: #FCAF50;
                color: #000;
            }
        </style>
    </head>
    
    <body>
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Type</th>
                    <th>URL</th>
                    <th>Titie</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>`
  message += await scrap('nordstromrack_women', module_nordstromrack_women.default);
  message += await scrap('nordstromrack_men', module_nordstromrack_men.default);
  message += await scrap('module_toddsnyder', module_toddsnyder.default);
  message += await scrap('deadstock', module_deadstock.default);
  message += await scrap('urbanoutfitters', module_urbanoutfitters.default);
  message += await scrap('feature_jordan', module_feature_jordan.default);
  message += await scrap('feature_nike', module_feature_nike.default);
  message += await scrap('theoutnet', module_theoutnet.default);
  message += await scrap('revolve', module_revolve.default);
  message += await scrap('moda3', module_moda3.default);
  message += await scrap('socialstatuspgh_adidas', module_socialstatuspgh_adidas.default);
  message += await scrap('socialstatuspgh_jordan', module_socialstatuspgh_jordan.default);
  message += await scrap('wishatl', module_wishatl.default);
  message += await scrap('packershoes_nike', module_packershoes_nike.default);
  message += await scrap('packershoes_jordan', module_packershoes_jordan.default);
  message += await scrap('stylebop', module_stylebop.default);


  message += await scrap('saintalfred', module_saintalfred.default)
  message += await scrap('kicksusa_men', module_kicksusa_men.default)
  // message += await scrap('kicksusa_women', module_kicksusa_women.default)
  // message += await scrap('kicksusa_kids', module_kicksusa_kids.default)
  message += await scrap('onenessboutique', module_onenessboutique.default)
  message += await scrap('citygear', module_citygear.default)
  message += await scrap('jimmyjazz_men', module_jimmyjazz_men.default)
  message += await scrap('jimmyjazz_women', module_jimmyjazz_women.default)
  message += await scrap('jimmyjazz_grade', module_jimmyjazz_grade.default)

  // message += await scrap('kickz', module_kickz.default)    // error on deploy
  //message += await scrap('shelta', module_shelta.default)
  message += await scrap('sneakerpolitics', module_sneakerpolitics.default)
  message += await scrap('ycmc_men_jordan', module_ycmc_men_jordan.default)
  message += await scrap('ycmc_men_nike', module_ycmc_men_nike.default)
  message += await scrap('ycmc_women_jordan', module_ycmc_women_jordan.default)
  // message += await scrap('ycmc_kids_jordan', module_ycmc_kids_jordan.default)    // deprecated
  // message += await scrap('ycmc_kids_nike', module_ycmc_kids_nike.default)        // deprecated 
  message += await scrap('asphaltgold', module_asphaltgold.default)
  message += await scrap('notreshop', module_notreshop.default)
  message += await scrap('hanonshop', module_hanonshop.default)
  message += await scrap('sotostore', module_sotostore.default)
  message += await scrap('lapstoneandhammer', module_lapstoneandhammer.default)
  message += await scrap('endclothing', module_endclothing.default)
  message += await scrap('corporategotem', module_corporategotem.default)
  message += await scrap('socialstatuspgh', module_socialstatuspgh.default)
  message += await scrap('bstn', module_bstn.default)
  message += await scrap('bdgastore_balance', module_bdgastore_balance.default)
  message += await scrap('bdgastore_jordan', module_bdgastore_jordan.default)
  message += await scrap('bdgastore_nike', module_bdgastore_nike.default)
  message += await scrap('centre214', module_centre214.default)
  message += await scrap('rsvpgallery', module_rsvpgallery.default)
  message += await scrap('rsvpgallery_nike', module_rsvpgallery_nike.default)
  message += await scrap('footpatrol', module_footpatrol.default)

  message += await scrap('shopwss', module_shopwss.default) //complete
  //message += await scrap('solebox', module_solebox.default) //complete
  message += await scrap('undefeat_nike', module_undefeat_nike.default) //complete
  message += await scrap('undefeat_jordan', module_undefeat_jordan.default) //complete
  message += await scrap('sneakersnstuff', module_sneakersnstuff.default) //complete

  message += await scrap('renarts_men', module_renarts_men.default) //complete
  message += await scrap('renarts_women', module_renarts_women.default) //complete
  message += await scrap('ubiqlife', module_ubiqlife.default) //complete

  //message += await module_overkillshop.scrap_overkillshop("scrap_overkillshop");

  message += `</tbody></table></body></html>`

  if (!developer_mode && !test_deploy_mode) {
    const sgMail1 = require('@sendgrid/mail')
    sgMail1.setApiKey(
      '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',
    )
    const msg1 = {
      to: 'buyer@arkamix.com',
      from: 'buyer@arkamix.com',
      subject: `Website Product Scrap Daily Report`,
      html: message,
    }
    sgMail1
      .send(msg1)
      .then(res => console.log('Successfully sent to me!'))
      .catch(err => console.log('Failed sent to me!'))
  }
}

//cron.schedule("* * 12 * *", function () {

allWebsites()

// cron.schedule("0 0 8,16 * * *", function () {
//     console.log("running a task every minute");

//     allWebsites();
// }, {
//         scheduled: true,
//         timezone: "America/Los_Angeles"
//     });

app.listen(process.env.PORT || 3128)
