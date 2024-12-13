let mongoose= require('mongoose');
let express= require('express');
let bcrypt= require('bcrypt');
let jwt = require("jsonwebtoken");
let usermodels=require('../models/admin');
const multer= require('multer');
let route= express();
const path = require("path");
const upload=require('../config/multer');


route.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await usermodels.findOne({ username :id});
    if (!user) {
      return res.status(404).send("User not found");
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

module.exports =route