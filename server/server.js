const express = require('express');
require('dotenv').config();
const app = express();
const {mongoose} = require('mongoose')

// db
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('DB connected'))
.catch((err) => console.log("DB not connected"))

