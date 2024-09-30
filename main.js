require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const connectDB = require('./db/main.js')

const app = express();
const PORT = process.env.PORT || 4000;



// middleware
app.use(express.urlencoded({extende: true}));
app.use(express.json());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false
}));

app.use((req, res, next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static('uploads'));

// template engine
app.set('view engine', 'ejs');

// router
const router = require('./routes/routes.js');
app.use('', router);

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server is listening at http://localhost:${PORT}`);
    })
})
.catch((err)=>{
    console.log('MongoDB connection failed: ',err);
})


// app.get('/', (req,res)=>{
//     res.send('Hello World');
// });

// app.listen(PORT, () => {
//     console.log(`Server is listening at http://localhost:${PORT}`);
// });