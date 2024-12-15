const mongoose = require('mongoose');
let connectdb= require('../config/db');
const { model } = mongoose; 

let adminSchema=new mongoose.Schema({
    password:{
        type:String,
        required: true
    },
    adminid:{
        type: String,
        required: true,
        unique: true
    }
})

module.exports = model ('admin',adminSchema);