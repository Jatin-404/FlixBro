// This file goes in client/src/components/Login.js
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider } from '../firebase';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let userCredential;
      
      if (isRegistering) {
        // Register new user
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Sign in existing user
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      // Pass user info back to App component
      onLogin(userCredential.user.email);
    } catch (error) {
      let errorMessage = "Authentication failed. Please try again.";
      
      // More descriptive error messages
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email. Please register.";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use. Please sign in instead.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Pass user info back to App component
      onLogin(result.user.email);
    } catch (error) {
      setError("Google sign-in failed. Please try again.");
      console.error("Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <h2 className="login-title">{isRegistering ? 'Create Account' : 'Sign In'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleEmailAuth}>
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
        </button>
      </form>
      
      <div className="auth-divider">
        <span>OR</span>
      </div>
      
      <button 
        type="button" 
        className="google-button" 
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <span className="google-icon">G</span>
        Continue with Google
      </button>
      
      <p className="auth-toggle">
        {isRegistering 
          ? 'Already have an account? ' 
          : "Don't have an account? "}
        <span 
          className="auth-toggle-link" 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Sign In' : 'Register'}
        </span>
      </p>
    </div>
  );
}

export default Login;