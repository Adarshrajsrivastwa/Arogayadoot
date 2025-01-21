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

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,   // Your Razorpay Key ID
  key_secret: process.env.RAZORPAY_KEY_SECRET  // Your Razorpay Key Secret
});

app.post('/create/orderId', async (req, res) => {
  const options = {
    amount: 220* 100,
    currency: "INR",
  };

  try {
    const order = await razorpay.orders.create(options); 
    res.send(order);
    await Payment.create({
      orderId: order.id,
      amount: order.amount / 100, 
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
    const doctors = await Doctor.find({ status: 'pending' });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

app.get('/api/doctor/confirm', async (req, res) => {
  try {
    const doctor = await Doctor.find({ status:'approved'});
    res.json(doctor);
  } catch (error) {
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