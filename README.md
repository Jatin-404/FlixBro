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
