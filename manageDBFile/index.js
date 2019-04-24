
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
                            json = JSON.parse(result.rows[0].data)
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
    return new Promise(async (resolve, reject) => {
        var pg = require('pg');

        await pg.connect(process.env.DATABASE_URL, async function (err, client, done) {
            var handleError = function (err) {
                if (!err) return false;
                done(client);
                return true;
            };
            let res = false;
            let exist = false;
            // console.log(JSON.stringify(json))

            await client.query(`SELECT * FROM product_table_json where url = '${fileName}'`, function (err, result) {
                if (handleError(err, client, done)) {
                    console.log('error occured where select')
                    exist = false;
                    reject(null)
                }

                done();
                if (result && result.rows.length > 0) {
                    exist = true;
                }
            });

            const data = JSON.stringify(json)

            if (exist) {
                await client.query(`UPDATE product_table_json SET url = '${fileName}', data = '${data}' where url = '${fileName}'`, function (err, result) {
                    if (handleError(err, client, done)) reject(null)

                    console.log('Update successfully')
                    done();
                    pg.end();
                    res = true;
                });
            } else {
                await client.query(`INSERT into product_table_json (url, data) Values('${fileName}', '${data}')`, function (err, result) {
                    if (handleError(err, client, done)) reject(null)

                    console.log('Insert successfully')
                    done();
                    pg.end();
                    res = true;
                });
            }

            console.log('end')
            resolve('Success to Save')
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