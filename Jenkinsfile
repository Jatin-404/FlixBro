pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = 'jatindocker10/client'
        BACKEND_IMAGE = 'jatindocker10/server'
    }

    stages {
        stage('Clone Repo') {
            steps {
                git url: 'https://github.com/Jatin-404/FlixBro.git', branch: 'main'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('client') {
                    // Specify the custom frontend Dockerfile
                    sh 'docker build -f Dockerfile -t $FRONTEND_IMAGE .'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('server') {
                    // Specify the custom backend Dockerfile
                    sh 'docker build -f Dockerfile -t $BACKEND_IMAGE .'
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withDockerRegistry([credentialsId: 'dockerhub-credentials', url: '']) {
                    sh 'docker push $FRONTEND_IMAGE'
                    sh 'docker push $BACKEND_IMAGE'
                }
            }
        }

        stage('Deploy (Optional)') {
            steps {
                echo 'Deploying application...'
                // Example: docker-compose pull && docker-compose up -d
            }
        }
    }
}
