// This goes in your server/server.js file
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const natural = require('natural');
const stopword = require('stopword');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log("DB not connected", err));

// Updated Schema: Movie and Review schemas
const reviewSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sentiment: { type: String, required: true }, // "positive" or "negative"
  sentimentScore: { type: Number, default: 0 }, // Range from -1 (very negative) to 1 (very positive)
  date: { type: Date, default: Date.now }
});

const movieSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    unique: true // Ensures movie titles are unique
  },
  reviews: [reviewSchema] // Array of reviews
});

const Movie = mongoose.model('Movie', movieSchema);

// Set up Natural language processing tools
const tokenizer = new natural.WordTokenizer();
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const stemmer = natural.PorterStemmer;

// Enhanced sentiment analysis function
function analyzeSentiment(text) {
  // Tokenize and clean text
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Remove stopwords (common words like "the", "and", etc.)
  const filteredTokens = stopword.removeStopwords(tokens);
  
  // Stem each word (reduce to root form)
  const stemmed = filteredTokens.map(token => stemmer.stem(token));
  
  // Calculate sentiment score (-1 to 1 range)
  const sentimentScore = analyzer.getSentiment(stemmed);
  
  // Convert to simple positive/negative classification
  const sentiment = sentimentScore >= 0 ? 'positive' : 'negative';
  
  return { sentiment, sentimentScore };
}

// Routes
// Get all movies with their reviews
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ 'reviews.date': -1 });
    res.json(movies);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server Error');
  }
});

// Add a new review to a movie
app.post('/api/movies', async (req, res) => {
  try {
    const { title, review } = req.body;
    
    // Analyze sentiment
    const analysis = analyzeSentiment(review);
    
    // Create review object
    const newReview = {
      text: review,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      date: new Date()
    };
    
    // Check if movie already exists
    let movie = await Movie.findOne({ title });
    
    if (movie) {
      // Add new review to existing movie
      movie.reviews.push(newReview);
    } else {
      // Create new movie with the review
      movie = new Movie({
        title,
        reviews: [newReview]
      });
    }
    
    // Save the movie
    await movie.save();
    
    // Return all movies
    const movies = await Movie.find().sort({ 'reviews.date': -1 });
    res.json(movies);
    
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server Error');
  }
});

// New route for sentiment analysis
app.post('/api/analyze', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const analysis = analyzeSentiment(text);
    res.json(analysis);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));