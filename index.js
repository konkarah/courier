if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const express = require('express')
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser')
const passport = require('passport')
const methodoverride = require('method-override')
const flash = require('express-flash')
const session = require('express-session')
const mongoose = require('mongoose')
const User = require('./models/courierLogin')
const bcrypt = require('bcrypt')
const port = 3010

//middleware
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set('view engine', 'ejs');
app.use( express.static( "public" ) );
app.use(express.urlencoded({extended: false}));
app.use(cors());
const initialisepassport = require('./passport-config');
const { appendFile } = require('fs');
const timeout = require('rest/interceptor/timeout');
initialisepassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id));

app.use(cors());
app.use(methodoverride('_method'));
app.use( express.static( "public" ) );
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//connect to mongodb
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
  res.render('courierLogin')
})
 
app.get('/signin', checknotauthenticated,(req, res) => {
    res.render('signin');
});

app.post('/signin',checknotauthenticated, passport.authenticate('local', {
    successRedirect: 'homepage',
    failureRedirect: 'signin',
    failureFlash: true
}));

app.get('/signup', (req, res) => {
    res.render('courierSignup');
});

app.post('/signup',checknotauthenticated, async (req, res) => {
    try {
        const hashedpassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            email: req.body.email,
            password: hashedpassword,
            id: Date.now().toString()
          });
        res.redirect('home');
    } catch(error)  {
        res.redirect('courierSignup');
        console.log(error);
    }
})

app.get('/home', (req,res)=> {
    res.render('courierHome')
})
app.get('/delivery', (req,res)=> {
    res.render('courierTransaction')
})
function checkauthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('signin');
}

function checknotauthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('homepage');
    }
    next();
}
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})