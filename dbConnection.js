const mongoose = require('mongoose');

const dbUrl = process.env.LOCALDB_URL;
main()
    .then((res) => {
        console.log("Connection Successful to DB");
    })
    .catch((e) => {
        console.log("Error in db");
        console.log(e);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

module.exports = main;

