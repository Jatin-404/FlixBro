pipeline {
    agent any  // This tells Jenkins to run the pipeline on any available node.

    environment {
        NODE_IMAGE = 'node:16-alpine'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git credentialsId: 'git-credentials', url: 'https://github.com/Jatin-404/FlixBro.git', branch: 'main'
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    // This runs npm install inside a Docker container.
                    docker.image(NODE_IMAGE).inside {
                        sh 'npm install'
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // This runs npm test inside the Docker container.
                    docker.image(NODE_IMAGE).inside {
                        sh 'npm test'
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build Docker image for your app
                    dockerImage = docker.build("flixbro-app:latest")
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // Run the container in detached mode on the specified port
                    sh 'docker run -d -p 3000:3000 flixbro-app:latest'
                }
            }
        }
    }

    post {
        failure {
            echo 'Build or deployment failed!'
        }
    }
}
