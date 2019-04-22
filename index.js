//const cron = require("node-cron");
const express = require("express");
let nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var path = require("path");

var module_onenessboutique = require("./onenessboutique.js")
var module_finishline_men = require("./finishline_men.js")
var module_citygear = require("./citygear.js")
var module_jimmyjazz = require("./jimmyjazz.js")
var module_kickz = require("./kickz.js")
var module_saintalfred = require("./saintalfred")
var module_shelta = require("./shelta")
var module_sneakerpolitics = require("./sneakerpolitics")
var module_overkillshop = require("./overkillshop")
var module_ycmc = require("./ycmc")
var module_asphaltgold = require("./asphaltgold")
var module_notreshop = require("./notre-shop")
var module_hanonshop = require("./hanonshop")
var module_sotostore = require("./sotostore")
var module_lapstoneandhammer = require("./lapstoneandhammer")
var module_hibbett_men = require("./hibbett_men")

app = express();

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

let allWebsites = async () => {
    let message = ``;

    //message += await module_finishline_men.scrap_finishline_men("scrap_finishline_men");

    message += await module_onenessboutique.scrap_onenessboutique("scrap_onenessboutique"); //complete
    message += await module_citygear.scrap_citygear("scrap_citygear");    //complete
    message += await module_jimmyjazz.scrap_jimmyjazz("scrap_jimmyjazz");   //complete
    message += await module_kickz.scrap_kickz("scrap_kickz"); //completed
    message += await module_saintalfred.scrap_saintalfred("scrap_saintalfred"); //complete
    message += await module_shelta.scrap_shelta("scrap_shelta"); //complete
    message += await module_sneakerpolitics.scrap_sneakerpolitics("scrap_sneakerpolitics"); //completed
    message += await module_overkillshop.scrap_overkillshop("scrap_overkillshop"); //completed
    message += await module_ycmc.scrap_ycmc("scrap_ycmc"); //completed
    message += await module_asphaltgold.scrap_asphaltgold("scrap_asphaltgold"); //completed
    message += await module_notreshop.scrap_notreshop("scrap_notreshop"); //completed
    message += await module_hanonshop.scrap_hanonshop("scrap_hanonshop"); //completed
    message += await module_sotostore.scrap_sotostore("scrap_sotostore"); //completed
    message += await module_lapstoneandhammer.scrap_lapstoneandhammer("scrap_lapstoneandhammer"); //completed

    //message += await module_hibbett_men.scrap_hibbett_men("scrap_hibbett_men");


    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey("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");
    const msg = {
        to: 'shasta0312@outlook.com',
        from: 'arkamixkicks@gmail.com',
        subject: `Website Product Scrap Daily Report`,
        html: message
    };
    sgMail.send(msg).then(res => console.log('Successfully sent to client!', res)).catch(err => console.log('Failed sent to client!', err));

    const sgMail1 = require('@sendgrid/mail');
    sgMail1.setApiKey("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");
    const msg1 = {
        to: 'buyer@arkamix.com',
        from: 'arkamixkicks@gmail.com',
        subject: `Website Product Scrap Daily Report`,
        html: message
    };
    sgMail1.send(msg1).then(res => console.log('Successfully sent to me!', res)).catch(err => console.log('Failed sent to client!', err));

}

//cron.schedule("* * 12 * *", function () {

allWebsites();

// cron.schedule("0 0 8,16 * * *", function () {
//     console.log("running a task every minute");

//     allWebsites();
// }, {
//         scheduled: true,
//         timezone: "America/Los_Angeles"
//     });


app.listen(process.env.PORT || 3128);