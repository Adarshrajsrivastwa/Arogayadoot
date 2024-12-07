let express= require('express');
let mongoose= require('mongoose');
const path = require('path');
let dotenv = require('dotenv');

dotenv.config();

PORT=3000;


let app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req, res) => {
    res.send("welcome to my website");
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });