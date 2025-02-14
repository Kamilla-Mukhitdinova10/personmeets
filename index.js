const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();

const userRouter = require('./routes/userRoute')
const postRouter = require('./routes/postRoute')
const followRouter = require('./routes/followRoute')
const quizRouter = require('./routes/quizRoute');
const lectureRouter = require('./routes/lectureRoute');


const PORT = 3000;
const HOST = 'localhost';
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
   secret: 'session_code',
   resave: false,
   saveUninitialized: true
}));

app.use('/', postRouter);
app.use('/', userRouter); 
app.use('/', followRouter); 
app.use('/', quizRouter); 
app.use('/', lectureRouter);

app.get('/', (req, res) => {
   if (req.session.user) {
      res.sendFile(__dirname + '/public/home.html')
   } else {
      res.redirect('/login');
   }
});

app.get('/login', (req,res) => {
    res.sendFile(__dirname + '/public/login.html')
})

app.get('/register', (req,res) => {
    res.sendFile(__dirname + '/public/register.html')
})

// app.get('/admin', (req, res) => {
//    if (req.session.user) {
//       if(req.session.user.role == "admin"){
//          res.sendFile(__dirname + '/public/admin.html')
//       } else {
//          res.redirect('/login')
//       }
//    } else {
//       res.redirect('/login')
//    }
// })

app.get('/admin', (req, res) => {
   res.sendFile(__dirname + '/public/admin.html')
})

// app.get('/moder', (req, res) => {
//    res.sendFile(__dirname + '/public/moder.html')
// })

// app.get('/moder', (req, res) => {
//    if (req.session.user) {
//       if(req.session.user.role == "moder"){
//          res.sendFile(__dirname + '/public/moder.html')
//       } else {
//          res.redirect('/login')
//       }
//    } else {
//       res.redirect('/login')
//    }
// })

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
       if (err) {
          console.error(err);
       } else {
          res.redirect('/login');
       }
    });
});

app.listen(PORT, () => console.log(`http://${HOST}:${PORT}`));