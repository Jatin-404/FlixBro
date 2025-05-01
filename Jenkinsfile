pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        DOCKER_REGISTRY = 'your-docker-registry'  // Replace with your Docker registry
        CLIENT_IMAGE = "${DOCKER_REGISTRY}/flixbro-client:${env.BUILD_NUMBER}"
        SERVER_IMAGE = "${DOCKER_REGISTRY}/flixbro-server:${env.BUILD_NUMBER}"
        DOCKER_HUB_CREDS = credentials('your-docker-hub-credentials-id') // Replace with your Docker Hub credentials ID
    }

    tools {
        nodejs 'Node16'  // Assuming you have configured NodeJS 'Node16' in Jenkins
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Install Client Dependencies') {
                    steps {
                        dir('client') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Install Server Dependencies') {
                    steps {
                        dir('server') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Build Client') {
                    steps {
                        dir('client') {
                            sh 'npm run build'  // Assuming you have a build script in your package.json
                        }
                    }
                }
                stage('Build Server') {
                    steps {
                        dir('server') {
                            sh 'npm run build'  // Assuming you have a build script in your package.json
                        }
                    }
                }
            }
        }

        stage('Check Docker and Docker Compose') {
            steps {
                sh 'docker --version || echo "Docker is not installed!"'
                sh 'docker-compose --version || echo "Docker Compose is not installed!"'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Build the Docker images
                    sh 'docker build -t ${CLIENT_IMAGE} -f client/Dockerfile ./client'
                    sh 'docker build -t ${SERVER_IMAGE} -f server/Dockerfile ./server'
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    // Docker login to Docker Hub (using stored credentials)
                    withCredentials([usernamePassword(credentialsId: 'your-docker-hub-credentials-id', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                    }
                    
                    // Push client and server images
                    sh 'docker push ${CLIENT_IMAGE}'
                    sh 'docker push ${SERVER_IMAGE}'

                    // Also tag and push images as "latest"
                    sh 'docker tag ${CLIENT_IMAGE} ${DOCKER_REGISTRY}/flixbro-client:latest'
                    sh 'docker tag ${SERVER_IMAGE} ${DOCKER_REGISTRY}/flixbro-server:latest'
                    sh 'docker push ${DOCKER_REGISTRY}/flixbro-client:latest'
                    sh 'docker push ${DOCKER_REGISTRY}/flixbro-server:latest'
                }
            }
        }

        stage('Run Docker Compose') {
            steps {
                script {
                    // Stop and remove any running containers before starting new ones
                    sh 'docker-compose down || true'
                    // Start containers with Docker Compose
                    sh 'docker-compose up -d --build'
                }
            }
        }

        stage('Check Running Containers') {
            steps {
                sh 'docker ps'  // List running containers to verify if everything is running
            }
        }
    }

    post {
        success {
            echo '✅ Build and Docker Compose run completed successfully!'
        }
        failure {
            echo '❌ Build or Docker Compose run failed!'
        }
        always {
            echo 'You can visit the frontend at http://<your-server-ip>:80'
        }
    }
}
