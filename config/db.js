// use mongoose as DB layer on top off express
const mongoose = require('mongoose');
// Config allows us to use URI global over the application
const config = require('config');
// getting the MONGOURI from default in config folder config is an npm packet.
const db = config.get('mongoURI');

// verbinden maken met atlast DB -> dit geeft promise hier gebruiken wij een async/await 
const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })
        console.log("MONGO DB CONNECTED");
    } catch (err) {
        console.error(err.message);
        //exit process with failure 
        process.exit(1);
    }
}

module.exports = connectDB;