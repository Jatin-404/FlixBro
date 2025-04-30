"# FlixBro" 
FlixBro is an intelligent platform that collects movie reviews from users, analyzes them using Machine Learning to classify them as positive or negative, and integrates this data with existing reviews from sources like IMDB and Rotten Tomatoes.

When a user submits a review, FlixBro:

Analyzes the sentiment of the user’s review (+ve or -ve) using TensorFlow.
Fetches additional reviews from IMDB and Rotten Tomatoes.
Stores the user review alongside external data in the MySQL database.
Combines all reviews to provide a comprehensive sentiment analysis.




for error in front end
set NODE_OPTIONS=--openssl-legacy-provider
npm start

# MovieFlix Reviews App

A movie review application with sentiment analysis and Firebase authentication, containerized using Docker.

## Project Structure

```
movieflix-app/
├── client/               # React frontend
│   ├── public/           # Static files
│   ├── src/              # Frontend source code
│   ├── Dockerfile        # Client Dockerfile
│   └── nginx.conf        # Nginx configuration
├── server/               # Express backend
│   ├── Dockerfile        # Server Dockerfile
│   └── server.js         # Main server file
├── .env                  # Environment variables (not committed to git)
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # This file
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Firebase project with authentication enabled

## Firebase Setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password and Google authentication methods
3. Register your app to get Firebase configuration
4. Generate a service account key for admin SDK

## Environment Variables

Create a `.env` file in the root directory with the following content:

```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@example.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
```

## Firebase Configuration

Update the `client/src/firebase.js` file with your Firebase web config:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Running the App with Docker

1. Build and start the containers:

```bash
docker-compose up --build
```

2. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000/api

3. To stop the containers:

```bash
docker-compose down
```

## Development Mode

For development, you can run each service separately:

### Client

```bash
cd client
npm install
npm start
```

### Server

```bash
cd server
npm install
npm run dev
```

## Docker Commands Reference

- Build and start containers: `docker-compose up --build`
- Start containers in background: `docker-compose up -d`
- Stop containers: `docker-compose down`
- View logs: `docker-compose logs -f`
- View specific service logs: `docker-compose logs -f server`
- Access MongoDB shell: `docker exec -it movieflix-mongo mongosh`

## Security Notes

- Never commit the `.env` file to version control
- Protect your Firebase credentials
- Replace placeholder credentials with actual values for production


Step 8: Managing Your Application

To stop the containers:
bashdocker-compose down

To start again without rebuilding:
bashdocker-compose up

To view logs:
bashdocker-compose logs -f

To check running containers:
bashdocker ps