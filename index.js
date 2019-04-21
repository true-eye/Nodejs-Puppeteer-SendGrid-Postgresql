//const cron = require("node-cron");
const express = require("express");
let nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var path = require("path");

var module_onenessboutique = require("./onenessboutique.js")
var module_finishline_men = require("./finishline_men.js")
var module_citygear = require("./citygear.js")
var module_jimmyjazz = require("./jimmyjazz.js")

app = express();

//create mail transporter

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
}));

let allWebsites = async () => {
    let message = ``;
    message += await module_onenessboutique.scrap_onenessboutique("scrap_onenessboutique"); //complete
    //message += await module_finishline_men.scrap_finishline_men("scrap_finishline_men");
    message += await module_citygear.scrap_citygear("scrap_citygear");    //complete
    message += await module_jimmyjazz.scrap_jimmyjazz("scrap_jimmyjazz");   //complete
    //message += `<h3>Hello! This is a Test!!!</h3>`
    //console.log(message)

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey("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");
    const msg = {
        to: 'shasta0312@outlook.com',
        from: 'arkamixkicks@gmail.com',
        ubject: `Website Product Scrap Daily Report`,
        html: message
    };
    sgMail.send(msg);

    /*let mailOptions = {
        from: "arkamixkicks@gmail.com",
        to: "info@arkamix.com",
        subject: `Website Product Scrap Daily Report`,
        html: message
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('failed to send message')
            throw error;
        } else {
            console.log("Email successfully sent!");
        }
    });

    let mailOptions2 = {
        from: "arkamixkicks@gmail.com",
        to: "shasta0312@outlook.com",
        subject: `Website Product Scrap Daily Report`,
        html: message
    };
    transporter2.sendMail(mailOptions2, function (error, info) {
        if (error) {
            console.log('failed to send message')
            throw error;
        } else {
            console.log("Email successfully sent!");
        }
    });*/
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