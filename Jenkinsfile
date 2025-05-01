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
                sh 'docker-compose --version || echo "Docker Compose is not installed!"'
            }
        }

        stage('Build and Run with Docker Compose') {
            steps {
                sh 'docker-compose down || true' // stop previous containers if running
                sh 'docker-compose up -d --build'
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
            echo 'Docker containers are up and running!'
        }
        failure {
            echo 'Docker compose run failed.'
        }
        always {
            echo 'You can visit the frontend at http://<your-server-ip>:80'
        }
    }
}
