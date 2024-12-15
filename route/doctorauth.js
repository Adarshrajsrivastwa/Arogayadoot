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
    const { name, phone, email, specialization, password } = req.body;

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
      certificate,
      password: hash,
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
      const user = await usermodels.findOne($or[{ username:email },{username:phone}]);

      if(user.status ==="pending"){
        return res.status(401).json({ error: "Doctor is not yet approved by admin." });  // Send error message if doctor's status is pending.  // This should be replaced with an email or notification system.  // In a real-world application, the admin approval status should be stored in a separate database table.  // And the admin approval status should be fetched and checked before allowing the login.  // In this case, we are assuming that the admin approval status is stored in the database and we are using the provided email or phone number for login.  // In a real-world application, you should fetch the admin approval status from the database.  // The admin approval status should be stored in a separate database table and checked before allowing the login.  // In this case, we are assuming that the admin approval status is stored in the database and we are using the provided email or phone number for login.  // In a real-world
      }
      if (!user) {
        return res.status(404).send("Doctor not found");
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send("Invalid credentials");
      }
      const token = jwt.sign(
        { username: user.username, password: user.password },
        process.env.JWT_TOKEN, 
        { expiresIn: "1h" }
      );
      res.cookie("token", token, { httpOnly: true });
      res.status(200).redirect("/");
    } catch (error) {
      console.error("Error during login:", error.message);
      res.status(500).send("An error occurred while processing your request");
    }
  });



  module.exports = route;
  