
const fs = require("fs");




let load_from_file = (fileName) => {
    return new Promise((resolve, reject) => {
        var pg = require('pg');
        const client = pg.connect(process.env.DATABASE_URL, async function (err, client, done) {
            var handleError = function (err) {
                if (!err) return false;
                done(client);
                return true;
            };
            let json = [];
            // await client.query(`DROP TABLE product_table`, function (err, result) {
            //     if (handleError(err, client, done)) {
            //         console.log('error occured while dropping')
            //         reject(null);
            //     }
            //     console.log(err, result)
            // })
            await client.query(`CREATE TABLE IF NOT EXISTS product_table_json (
                url varchar(25),  
                data json,
                PRIMARY KEY (url)  
            )`, function (err, result) {
                    if (handleError(err, client, done)) {
                        console.log('error occured')
                        reject(null);
                    }
                }
            )

            // await client.query(`UPDATE product_table SET url = '${fileName}', data = '[{"ref":"abc", "title":"ttt", "price":"$20"}]' where url = '${fileName}'`, function (err, result) {
            //     if (handleError(err, client, done)) return

            //     console.log('Saved successfully')
            //     done();
            //     result = true;
            // });
            await client.query(`SELECT * FROM product_table_json where url = '${fileName}'`, function (err, result) {
                if (handleError(err, client, done)) {
                    console.log('error occured where select')
                    reject(null);
                    return;
                }

                done();
                pg.end();
                console.log(result)
                if (result) {
                    if (result.rows.length > 0) {
                        if (result.rows.length != 1) {
                            console.log('error length is not 1')
                            return false;
                        } else {
                            json = result.rows[0].data
                            return true;
                        }
                    }
                }
            });

            console.log('original product count: ', json.length);
            resolve(json);
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
            // console.log(JSON.stringify(json))

            client.query(`SELECT * FROM product_table_json where url = '${fileName}'`, function (err, result) {
                if (handleError(err, client, done)) {
                    console.log('error occured where select')
                    exist = false;
                    reject(null)
                    return;
                }

                const data = JSON.stringify(json)
                //console.log(data)
                if (result && result.rows.length > 0) {
                    client.query(`UPDATE product_table_json SET url = '${fileName}', data = '${data}' where url = '${fileName}'`, function (err, update_result) {
                        if (handleError(err, client, done)) {
                            console.log('update error')
                            reject(null)
                            return;
                        }

                        console.log('Update successfully')
                        done();
                        pg.end();
                        resolve('Success to Save')
                    });
                } else {
                    client.query(`INSERT into product_table_json (url, data) Values('${fileName}', '${data}')`, function (err, insert_result) {
                        if (handleError(err, client, done)) {
                            console.log('insert error')
                            reject(null)
                            return;
                        }

                        console.log('Insert successfully')
                        done();
                        pg.end();
                        resolve('Success to Save')
                    });
                }
            });
        });

        console.log('hello')

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