const multer = require('multer');
const path = require('path');

// Set up storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'upload')); // Ensure the 'upload' folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

// File type filter (only allow certain types of files)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf', // PDF
    'image/jpeg',       // JPG, JPEG
    'image/png',        // PNG
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Only PDF, JPG, PNG, and JPEG files are allowed'), false); // Reject file
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Optional: limit file size (10MB)
});

module.exports = upload;
