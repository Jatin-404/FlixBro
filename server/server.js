// This goes in your server/server.js file
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const natural = require('natural');
const stopword = require('stopword');
const admin = require('firebase-admin');
const app = express();

// Initialize Firebase Admin SDK
// You'll need to create a service account in the Firebase console
// and download the JSON key file
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("FIREBASE_PRIVATE_KEY present?", !!process.env.FIREBASE_PRIVATE_KEY);



admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});
// Middleware
app.use(express.json());
app.use(cors());

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// DB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log("DB not connected", err));

// Updated Schema: Movie and Review schemas
const reviewSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sentiment: { type: String, required: true }, // "positive", "negative", or "neutral"
  sentimentScore: { type: Number, default: 0 }, // Range from -1 (very negative) to 1 (very positive)
  date: { type: Date, default: Date.now },
  userId: { type: String, required: true } // Add user ID for identifying who wrote the review
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
  
  // Convert to simple positive/negative/neutral classification
  const sentiment = 
    sentimentScore > 0.05 ? 'positive' : 
    sentimentScore < -0.05 ? 'negative' : 
    'neutral';
  
  return { sentiment, sentimentScore };
}

// Routes
// Get all movies with their reviews
app.get('/api/movies', authenticateUser, async (req, res) => {
  try {
    const movies = await Movie.find().sort({ 'reviews.date': -1 });
    res.json(movies);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server Error');
  }
});

// Add a new review to a movie
app.post('/api/movies', authenticateUser, async (req, res) => {
  try {
    const { title, review } = req.body;
    const userId = req.user.uid; // Extract user ID from authenticated token
    
    // Analyze sentiment
    const analysis = analyzeSentiment(review);
    
    // Create review object
    const newReview = {
      text: review,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      date: new Date(),
      userId: userId
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
app.post('/api/analyze', authenticateUser, (req, res) => {
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