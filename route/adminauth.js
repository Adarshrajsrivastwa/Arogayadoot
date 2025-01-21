let mongoose= require('mongoose');
let express= require('express');
let bcrypt= require('bcrypt');
let jwt = require("jsonwebtoken");
let usermodels=require('../models/admin');
const multer= require('multer');
let route= express();
const path = require("path");
const upload=require('../config/multer');


route.post("/register", async (req, res) => {
  let { username, password } = req.body;

  if (!password) {
    return res.status(400).send("Password is required");
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await usermodels.create({
      admin:username,
      password: hash,
    });

    const token = jwt.sign({ username,password }, process.env.JWT_TOKEN);

    res.cookie("token", token, { httpOnly: true, secure: true });
    res.status(200).redirect("/dashboard");

  } catch (err) {
    console.error(err);
    return res.status(500).send("Error creating user");
  }
});



route.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await usermodels.findOne({admin: username});
    if (!user) {
      return res.status(404).send("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid credentials");
    }
   const token = jwt.sign({ username }, process.env.JWT_TOKEN);
       res.cookie("token", token, { httpOnly: true, secure: true });
    res.status(200).redirect("/dashboard1");
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).send("An error occurred while processing your request");
  }
});

module.exports =route;