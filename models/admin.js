const mongoose = require('mongoose');
let connectdb= require('../config/db');
const { model } = mongoose; 

let adminSchema=new mongoose.Schema({
    username:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    },
    id:{
        type: String,
        required: true
    }
    
})