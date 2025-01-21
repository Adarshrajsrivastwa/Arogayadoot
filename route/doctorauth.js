let mongoose= require('mongoose');
let express= require('express');
let bcrypt= require('bcrypt');
let jwt = require("jsonwebtoken");
let usermodels=require('../models/doctor');
const multer= require('multer');
let route= express();
const path = require("path");
const upload=require('../config/multer');


route.post('/register', upload.single('certificate'), async (req, res) => {
  try {
    const { name, phone, email, specialization, password,hospital,charge } = req.body;

    // Check if the file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a valid certificate file (PDF, JPG, PNG, or JPEG)." });
    }

    const certificate = req.file.path; // Path to the uploaded file

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Save doctor to the database
    const doctor = new usermodels({
      name,
      phone,
      email,
      specialization,
      hospital,
      certificate,
      password: hash,
      charge,
      language:'Hindi,English',
      status: 'pending', // Default status
    });
    await doctor.save();

    // Generate JWT token
    const token = jwt.sign({ email, phone }, process.env.JWT_TOKEN);
    res.cookie("token", token, { httpOnly: true, secure: true });

    res.status(201).json({ message: "Doctor registered successfully, waiting for admin approval." });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

route.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find the user by either username (email) or phone
    const user = await usermodels.findOne({
      $or: [{ username: username }, { phone: username }]  // Username can be either email or phone
    });

    if (!user) {
      return res.status(404).send("Doctor not found");
    }

    // Check if the doctor's status is 'pending'
    if (user.status === "pending") {
      return res.status(401).send("Doctor is not yet approved by admin.");
    }

    // Compare the password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid credentials");
    }

    // Generate the JWT token with the relevant user details
    const token = jwt.sign(
      { username: user.username, email: user.email, id: user._id },  // Use relevant details in the payload
      process.env.JWT_TOKEN,  // Make sure the secret key is in your .env file
      { expiresIn: "1h" }
    );

    // Send the token as a cookie (httpOnly for security)
    res.cookie("token", token, { httpOnly: true });

    // Redirect after successful login
    res.status(200).redirect("/");

  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).send("An error occurred while processing your request");
  }
});




  module.exports = route;
  