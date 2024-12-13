let express= require('express');
let mongoose= require('mongoose');
const path = require('path');
let dotenv = require('dotenv');
let connectdb= require('./config/db.js');
let userauth = require('./route/userauth.js');
let doctorauth = require('./route/doctorauth.js');
let session= require('express-session');
let passport= require('passport');
let cors= require('cors');
let bcrypt= require('bcrypt');
let jwt = require("jsonwebtoken");
let User= require('./models/user');
const cookieParser = require('cookie-parser');
const uploadRoutes = require("./route/doctorauth");
const adminauth = require('./config/admin.js');


dotenv.config();
connectdb();

PORT=3000;


let app = express();




app.use(cors());  

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,   
  resave: false,             
  saveUninitialized: false,  
}));


app.use(cookieParser());


app.use(cors());  

// authantication
app.use('/authuser', userauth);
app.use('/authdoctor', doctorauth)
app.use('/adminauth', adminauth)




app.get('/',(req, res) => {
    res.send("welcome to my website");
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });