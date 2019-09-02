const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// instantiate app, setup env variables, connect to db
const app = express();
dotenv.config();
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => console.log('Connected to db'));

// setup middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.ORIGIN,
        credentials: true
    })
);

// use routes
app.use('/auth', require('./routes/authRouter'));

app.listen(process.env.PORT, () => {
    console.log('Server up and running');
});
