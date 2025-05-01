pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Check Docker and Docker Compose') {
            steps {
                sh 'docker --version || echo "Docker is not installed!"'
                sh 'docker compose version || echo "Docker Compose v2 is not installed!"'
            }
        }

        stage('Shutdown Previous Containers') {
            steps {
                sh 'docker compose down || true'
            }
        }

        stage('Build and Run with Docker Compose') {
            steps {
                sh 'docker compose up -d --build'
            }
        }

        stage('Check Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo '✅ Docker containers are up and running!'
            echo '🌐 Visit the frontend at http://<your-server-ip>:80'
        }
        failure {
            echo '❌ Docker Compose run failed. Please check logs.'
        }
        always {
            echo '🧼 Pipeline execution complete.'
        }
    }
}
