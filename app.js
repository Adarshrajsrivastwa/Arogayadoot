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
const adminauth = require('./route/adminauth');
const Payment = require('./models/payment.js');
const Razorpay = require('razorpay');
const Doctor = require('./models/doctor.js');





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


app.use('/authuser', userauth);
app.use('/authdoctor', doctorauth)
app.use('/adminauth', adminauth)


// authantication
// const authenticateToken = (req, res, next) => {
//   const token = req.headers['authorization']; 
//   console.log(token);

//   if (!token) {
//     return res.status(403).send('Token is required');
//   }
//   jwt.verify(token, 'process.env.JWT_TOKEN', (err, decoded) => {
//     if (err) {
//       return res.status(403).send('Invalid or expired token');
//     }
//     const email = decoded.email;
//     req.userEmail = email;
//     next();
//   });
// }

// app.get('/details', authenticateToken, async (req, res) => {
//   try {
//     const username = req.user.email; 
//     const user = await usermodels.findOne({ username:email });
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json({
//       username: user.username,
//       email: user.email,
//       phone: user.phone,
//       address: user.address,
//       dob: user.dob
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,   // Your Razorpay Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET  // Your Razorpay Key Secret
});

app.post('/create/orderId', async (req, res) => {
  const options = {
    amount: 220* 100, // amount in smallest currency unit (200 INR in paise)
    currency: "INR",
  };

  try {
    // Create the order via Razorpay API
    const order = await razorpay.orders.create(options); 
    res.send(order);

    // Save the order details in the database
    await Payment.create({
      orderId: order.id,
      amount: order.amount / 100, // Converting back to INR
      currency: order.currency,
      status: 'pending',
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).send('Error creating order');
  }
});


app.post('/api/payment/verify', async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const crypto = require('crypto');

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  // Verify if the generated signature matches the Razorpay signature
  if (generatedSignature === signature) {
    // Update payment status in the database
    await Payment.findOneAndUpdate(
      { orderId: razorpayOrderId },
      { paymentId: razorpayPaymentId, signature, status: 'completed' }
    );
    res.send('Payment verified successfully');
  } else {
    res.status(400).send('Payment verification failed');
  }
});

app.get('/api/doctors', async (req, res) => {
  try {
    // Ensure 'Doctor' model is used consistently
    const doctors = await Doctor.find({ status: 'pending' });
    res.json(doctors);
    console.log(doctors);  // You can remove this in production for security reasons
  } catch (error) {
    console.error(error);  // Log error for debugging
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

app.put('/api/doctor/:id', async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status is required to update the doctor' });
  }

  try {
    // Check if doctor exists before attempting to update
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);  // Log error for debugging
    res.status(500).json({ message: 'Error updating doctor status' });
  }
});

app.get('/',(req, res) => {
  res.render('login');
})



app.get('/patient',(req, res) => {
  res.render('patientsignup');
})

app.get('/doctor',(req, res) => {
  res.render('doctor');
})

app.get('/userlogin',(req, res) => {
  res.render('userlogin');
});

app.get('/doclogin',(req, res) => {
    res.render('logindoctor');
  });

  app.get('/adlogin',(req, res) => {
    res.render('loginadmin');
  });

  app.get('/uslogin',(req, res) => {
    res.render('userlogin');
  });

app.get('/sign',(req, res) => {
  res.render('signup');
});

app.get('/dashboard',(req, res) => {
  res.render('dashboard1');
})

app.get('/dashboard1',(req, res) => {
  res.render('dashboard2');
})

app.get('/form',(req, res) => {
  res.render('payment');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });