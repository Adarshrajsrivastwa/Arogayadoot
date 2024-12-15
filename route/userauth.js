let mongoose= require('mongoose');
let express= require('express');
let bcrypt= require('bcrypt');
let jwt = require("jsonwebtoken");
let usermodels=require('../models/user.js');
let route= express();

route.post("/register", async (req, res) => {
  let { username, dob, email, address, phone, password } = req.body;

  if (!password) {
    return res.status(400).send("Password is required");
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await usermodels.create({
      username,
      dob,
      email,
      phone,
      address,
      password: hash,
    });

    const token = jwt.sign({ username, phone, dob }, process.env.JWT_TOKEN);

    res.cookie("token", token, { httpOnly: true, secure: true });
    res.status(200).redirect("/dashboard");

  } catch (err) {
    console.error(err);
    return res.status(500).send("Error creating user");
  }
});

// login User
route.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // console.log(username);
    // console.log(password);
    
    // Find the user by either username (email) or phone
    const user = await usermodels.findOne({
      $or: [{ username: username }, { email: username }]  // Username can be either email or phone
    });


    if (!user) {
      return res.status(404).send("User not found");
    }

    // Compare the password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid credentials");
    }

    // Generate the JWT token with the relevant user details
    const token = jwt.sign(
      { username: user.username, email: user.email},  // Use relevant details in the payload
      process.env.JWT_TOKEN,  // Make sure the secret key is in your .env file
      { expiresIn: "1h" }
    );

    // Send the token as a cookie (httpOnly for security)
    res.cookie("token", token, { httpOnly: true });

    // Redirect after successful login
    res.status(200).redirect("/dashboard");

  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).send("An error occurred while processing your request");
  }
});

// Route to get user details by username

  module.exports = route;
