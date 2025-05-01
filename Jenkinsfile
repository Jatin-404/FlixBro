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

        stage('Check Docker Access') {
            steps {
                sh 'docker version || echo "❌ Docker not found"'
                sh 'docker compose version || echo "❌ Docker Compose not found"'
            }
        }

        stage('Stop Previous Containers') {
            steps {
                sh 'docker compose down || true'
            }
        }

        stage('Build and Run Containers') {
            steps {
                sh 'docker compose up -d --build'
            }
        }

        stage('Verify Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo '✅ All containers are up and running!'
            echo '🌐 Access frontend at http://<your-server-ip>:80'
        }
        failure {
            echo '❌ Something went wrong while running docker compose!'
        }
        always {
            echo '🧼 Pipeline finished.'
        }
    }
}
