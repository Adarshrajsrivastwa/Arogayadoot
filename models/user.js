const mongoose = require('mongoose');
let connectdb= require('../config/db');
const { model } = mongoose; 

let userschema = new mongoose.Schema({
    username:{
        type:String,
        required: true,
        unique: true
    },
    dob:{
        type:String,
        required: true
    },
    address:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    phone:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    }
});


module.exports = model ('User',userschema);