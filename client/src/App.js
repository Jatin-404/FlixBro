// This file goes in client/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

function App() {
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [movies, setMovies] = useState([]);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load TensorFlow model
  useEffect(() => {
    async function loadModel() {
      try {
        // For this example, we'll use a pre-trained TF.js sentiment model
        // In a real app, you'd host this model on your server
        const loadedModel = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json');
        setModel(loadedModel);
        console.log('Model loaded successfully');
        setLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        // Fall back to a dummy model for demonstration
        setLoading(false);
      }
    }
    loadModel();
  }, []);

  // Load all movies
  useEffect(() => {
    axios.get('/api/movies')
      .then(res => {
        setMovies(res.data);
      })
      .catch(err => console.error('Error fetching movies:', err));
  }, []);

  // Analyze sentiment using TensorFlow.js
  const analyzeSentiment = async (text) => {
    if (!model) {
      // If model failed to load, just do a basic check
      return text.includes('good') || text.includes('great') || text.includes('love') ? 'positive' : 'negative';
    }
    
    try {
      // Preprocess text - these steps are simplified
      const trimmed = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
      const wordIndex = {};
      const sequence = trimmed.map(word => wordIndex[word] || 0);
      
      // Make prediction
      const padSequence = tf.tensor2d([sequence]);
      const prediction = model.predict(padSequence);
      const score = prediction.dataSync()[0];
      
      return score > 0.5 ? 'positive' : 'negative';
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      // Fallback
      return text.includes('good') || text.includes('great') || text.includes('love') ? 'positive' : 'negative';
    }
  };

  // Add a new movie with review
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !review) {
      alert('Please enter both title and review');
      return;
    }
    
    // Analyze sentiment
    const sentiment = await analyzeSentiment(review);
    
    // Submit to server
    try {
      const res = await axios.post('/api/movies', {
        title,
        review,
        sentiment
      });
      
      // Add to state and reset form
      setMovies([res.data, ...movies]);
      setTitle('');
      setReview('');
      
    } catch (err) {
      console.error('Error adding movie:', err);
      alert('Error adding movie. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Movie Review Sentiment Analyzer</h1>
      </header>
      
      <div className="container">
        {loading ? (
          <p>Loading sentiment analyzer model...</p>
        ) : (
          <>
            <div className="form-section">
              <h2>Add a New Movie Review</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Movie Title:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter movie title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Your Review:</label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Write your review"
                    required
                  />
                </div>
                
                <button type="submit">Add Review</button>
              </form>
            </div>
            
            <div className="movies-section">
              <h2>Movie Reviews</h2>
              {movies.length === 0 ? (
                <p>No movies yet. Be the first to add one!</p>
              ) : (
                <div className="movie-list">
                  {movies.map(movie => (
                    <div key={movie._id} className={`movie-card ${movie.sentiment}`}>
                      <h3>{movie.title}</h3>
                      <p className="review-text">{movie.review}</p>
                      <p className="sentiment">
                        Sentiment: <span className={movie.sentiment}>{movie.sentiment}</span>
                      </p>
                      <p className="date">{new Date(movie.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;