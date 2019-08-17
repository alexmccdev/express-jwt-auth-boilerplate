const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const app = express();

// Import routes
const authRoute = require('./routes/auth');

dotenv.config();

// Connect to db
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true }, () => console.log('Connected to db'));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Route middleware
app.use('/api/auth', authRoute);

app.listen(process.env.PORT, () => {
    console.log('Server up and running');
});
