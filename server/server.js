// This goes in your server/server.js file
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DB connection (you already have this)
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log("DB not connected", err));

// Create a simple Movie Schema
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  review: { type: String, required: true },
  sentiment: { type: String, required: true }, // "positive" or "negative"
  date: { type: Date, default: Date.now }
});

const Movie = mongoose.model('Movie', movieSchema);

// Routes
// Get all movies
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ date: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add a new movie
app.post('/api/movies', async (req, res) => {
  try {
    const { title, review, sentiment } = req.body;
    const newMovie = new Movie({
      title,
      review,
      sentiment
    });
    const movie = await newMovie.save();
    res.json(movie);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));