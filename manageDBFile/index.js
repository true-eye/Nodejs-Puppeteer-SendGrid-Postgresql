
const fs = require("fs");
let load_from_file = (fileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile("./" + fileName, function (err, text) {
            if (!err) {
                let json = JSON.parse(text)
                console.log('original product count: ', json.length);
                resolve(json)
            } else {
                reject(null)
            }
        });
    })
}

let save_to_file = (fileName, json) => {
    return new Promise((resolve, reject) => {
        fs.writeFile("./" + fileName, JSON.stringify(json), function (err) {
            if (!err) {
                resolve("Saved successfully!")
            } else {
                reject(null)
            }
        });
    })
}

exports.load_from_file = load_from_file;
exports.save_to_file = save_to_file;