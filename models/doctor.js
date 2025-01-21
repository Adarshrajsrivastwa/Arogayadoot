const mongoose = require('mongoose');
let connectdb= require('../config/db');
const { model } = mongoose; 

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensure emails are unique
  },
  specialization: {
    type: String,
    required: true,
  },
  certificate: {
    type: String,  // This stores the file path to the uploaded PDF
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',  // Default status
  },
  hospital:{
    type:String,
    required: true,
  },
  language:{
    type: String,
    required: true,
  },
  charge:{
    type: Number,
    required: true,
  }
});

module.exports = model ('doctor',doctorSchema);