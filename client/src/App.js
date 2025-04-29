// This file goes in client/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Load all movies
  useEffect(() => {
    axios.get('/api/movies')
      .then(res => {
        setMovies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching movies:', err);
        setLoading(false);
      });
  }, []);

  // Analyze sentiment using our backend service
  const analyzeSentiment = async (text) => {
    try {
      setAnalyzing(true);
      const response = await axios.post('/api/analyze', { text });
      setAnalyzing(false);
      return response.data.sentiment;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      setAnalyzing(false);
      
      // Basic fallback just in case API fails
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'awesome', 'enjoyed', 'best', 'fantastic', 'wonderful'];
      const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'boring', 'disappointing', 'poor', 'waste'];
      
      let positiveScore = 0;
      let negativeScore = 0;
      
      const words = text.toLowerCase().split(/\W+/);
      
      words.forEach(word => {
        if (positiveWords.includes(word)) positiveScore++;
        if (negativeWords.includes(word)) negativeScore++;
      });
      
      return positiveScore > negativeScore ? 'positive' : 'negative';
    }
  };

  // Calculate sentiment score on a scale from -1 to 1
  const getSentimentScore = (review) => {
    // Simple algorithm to demonstrate scoring
    // This would be replaced by the actual sentiment score from your ML model
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'awesome', 'enjoyed', 'best', 'fantastic', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'boring', 'disappointing', 'poor', 'waste'];
    
    const words = review.toLowerCase().split(/\W+/);
    let score = 0;
    let totalMatches = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) {
        score += 1;
        totalMatches++;
      }
      if (negativeWords.includes(word)) {
        score -= 1;
        totalMatches++;
      }
    });
    
    return totalMatches === 0 ? 0 : score / totalMatches;
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
    const sentimentScore = getSentimentScore(review);
    
    // Submit to server
    try {
      const res = await axios.post('/api/movies', {
        title,
        review,
        sentiment,
        sentimentScore
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

  // Get the CSS class based on sentiment score
  const getSentimentClass = (score) => {
    if (!score && score !== 0) return 'neutral';
    if (score > 0.5) return 'very-positive';
    if (score > 0) return 'positive';
    if (score === 0) return 'neutral';
    if (score > -0.5) return 'negative';
    return 'very-negative';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Movie Review Sentiment Analyzer</h1>
      </header>
      
      <div className="container">
        {loading ? (
          <p>Loading movie reviews...</p>
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
                
                <button type="submit" disabled={analyzing}>
                  {analyzing ? 'Analyzing Sentiment...' : 'Add Review'}
                </button>
              </form>
            </div>
            
            <div className="movies-section">
              <h2>Movie Reviews</h2>
              {movies.length === 0 ? (
                <p>No movies yet. Be the first to add one!</p>
              ) : (
                <div className="movie-list">
                  {movies.map(movie => {
                    const sentimentClass = movie.sentimentScore !== undefined 
                      ? getSentimentClass(movie.sentimentScore) 
                      : movie.sentiment;
                    
                    return (
                      <div key={movie._id} className={`movie-card ${sentimentClass}`}>
                        <h3>{movie.title}</h3>
                        <p className="review-text">{movie.review}</p>
                        <div className="sentiment-container">
                          <p className="sentiment">
                            Sentiment: <span className={sentimentClass}>{movie.sentiment}</span>
                          </p>
                          {movie.sentimentScore !== undefined && (
                            <div className="sentiment-meter">
                              <div className="sentiment-bar">
                                <div 
                                  className={`sentiment-value ${sentimentClass}`}
                                  style={{ 
                                    width: `${Math.abs(movie.sentimentScore) * 100}%`,
                                    marginLeft: movie.sentimentScore < 0 ? 'auto' : '50%',
                                    marginRight: movie.sentimentScore >= 0 ? 'auto' : '50%'
                                  }}
                                ></div>
                                <div className="sentiment-center-line"></div>
                              </div>
                              <div className="sentiment-labels">
                                <span>Negative</span>
                                <span>Neutral</span>
                                <span>Positive</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="date">{new Date(movie.date).toLocaleDateString()}</p>
                      </div>
                    );
                  })}
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