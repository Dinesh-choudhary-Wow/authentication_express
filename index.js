const express = require('express');
const app = express();
const User = require('./models/user')
const port = 3000;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session')

// database connection
mongoose.connect('mongodb://localhost:27017/authDemo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!")
        console.log(err)
    })


//ejs accesing
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(session({
        secret: 'notagoodsecret',
        resave: false, //we use this two to stop showing the depreciated message in the console(bash)
        saveUninitialized: true,
    }))
    // middleware for the login to all routes were we use requiredLogin
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}

app.get('/', (req, res) => {
    res.send("this is the home page")
})
app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async(req, res) => {
    const { password, username } = req.body; //destructuring the data from body
    //  we get rid of hash becz we can also do with the mongo as mongo will do the hash before and save in it
    //const hash = await bcrypt.hash(password, 12); // hashing password
    //to save in database
    const user = new User({ username, password }) // it was password: hash and replaced with password as we are doing inthe models
    await user.save();
    req.session.user_id = user._id; // storing the id of user in the session if successfully sign 
    res.redirect('/')
        //res.send(hash); // to see hash in browser

})

app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', async(req, res) => {
    //res.send(req.body) used to check wether working or not
    const { password, username } = req.body;
    /* we get rid of this becs to reduce code in main app we moved to user models page and to use that here we use User.findAndValidate
    const user = await User.findOne({ username });
    //comparing hash password with the body user password
    const validPassword = await bcrypt.compare(password, user.password)
    */
    const foundUser = await User.findAndValidate(username, password);
    //after getting rid of that we change the validPassword to found user in the loop
    if (foundUser) {
        // and  change user to foundUser
        req.session.user_id = foundUser._id; // storing the id of user in the session if successfully login 
        res.redirect('/secret')
    } else {
        res.redirect('/login')
    }
})

app.post('/logout', (req, res) => {
    //req.session.user_id = null;
    req.session.destroy(); //to destry all the data(empty all data in session of all users)
    res.redirect('/login')
})

app.get('/secret', requireLogin, (req, res) => {
    /*  we can get rid of this as we are using the middleware requiredLogin 
    if (!req.session.user_id) // if user is not logined redirect to login page(auto redirect to login page)
     {
         return res.redirect('/login');
     } // if logined then show this message
     // res.send("THIS IS SECRET!! YOU CANNOT SEE ME UNLESS YOU ARE LOGGED IN!!")
     */
    res.render('secret')
})

// another try for the middleware login
app.get('/topsecret', requireLogin, (req, res) => {
    res.send("Top Secret")
})

app.listen(port, () => {
    console.log("Express Serving on port 3000!!")
})