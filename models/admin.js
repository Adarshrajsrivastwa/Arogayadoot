const mongoose = require('mongoose');
let connectdb= require('../config/db');
const { model } = mongoose; 

let adminSchema=new mongoose.Schema({
    admin:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    },
})

module.exports = model ('admin',adminSchema);