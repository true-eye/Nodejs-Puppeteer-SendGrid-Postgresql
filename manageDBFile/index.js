
const fs = require("fs");




let load_from_file = (fileName) => {
    return new Promise((resolve, reject) => {
        var pg = require('pg');
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            var handleError = function (err) {
                if (!err) return false;
                done(client);
                return true;
            };
            client.query(`CREATE TABLE IF NOT EXISTS product_table (
                url varchar(25),  
                data text,
                PRIMARY KEY (url)  
            )`, function (err, result) {
                    if (handleError(err, client, done)) {
                        console.log('error occured')
                        reject(null);
                    }
                })
            client.query(`SELECT * FROM product_table where url = '${fileName}'`, function (err, result) {
                if (handleError(err, client, done)) {
                    console.log('error occured where select')
                    reject(null);
                }

                done();
                pg.end();
                console.log(result)
                if (result) {
                    if (result.rows.length > 0) {
                        if (result.rows.length != 1) {
                            console.log('error length is not 1')
                            let json = [];
                            resolve(json)
                        } else {
                            let json = JSON.parse(result.rows[0])
                            console.log('original product count: ', json.length);
                            resolve(json)
                        }
                    }
                } else {
                    let json = [];
                    resolve(json)
                }
            });
        });

        // fs.readFile("./" + fileName, function (err, text) {
        //     if (!err) {
        //         let json = JSON.parse(text)
        //         console.log('original product count: ', json.length);
        //         resolve(json)
        //     } else {
        //         reject(null)
        //     }
        // });
    })
}
let save_to_file = (fileName, json) => {
    return new Promise((resolve, reject) => {
        var pg = require('pg');

        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            var handleError = function (err) {
                if (!err) return false;
                done(client);
                return true;
            };
            client.query(`UPDATE product_table SET data=${JSON.stringify(json)} WHERE url = ${fileName}`, function (err, result) {
                if (handleError(err, client, done)) reject(null);

                console.log('Saved successfully')
                done();
                pg.end();
            });
        });

        // fs.writeFile("./" + fileName, JSON.stringify(json), function (err) {
        //     if (!err) {
        //         resolve("Saved successfully!")
        //     } else {
        //         reject(null)
        //     }
        // });
    })
}

exports.load_from_file = load_from_file;
exports.save_to_file = save_to_file;