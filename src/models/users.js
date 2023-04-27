const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Users = new Schema({

    email: String,
    password: String,
    Count: Number,
    message: {
        send_body: [{ body: String, Enduser_id: String, sender: Boolean, receiver: Boolean, date: String }]
    },
})

module.exports = mongoose.model("users", Users)