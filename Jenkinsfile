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
        nodejs 'Node16'  // Ensure this matches the NodeJS version in Jenkins global tools
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
                            sh 'npm run build'  // Ensure the build script exists
                        }
                    }
                }
                stage('Build Server') {
                    steps {
                        dir('server') {
                            sh 'npm run build'  // Ensure the build script exists
                        }
                    }
                }
            }
        }

        stage('Check Docker and Docker Compose') {
            steps {
                script {
                    // Check Docker version
                    def dockerVersion = sh(script: 'docker --version', returnStdout: true).trim()
                    echo "Docker Version: ${dockerVersion}"

                    // Check Docker Compose version
                    def composeVersion = sh(script: 'docker-compose --version', returnStdout: true).trim()
                    echo "Docker Compose Version: ${composeVersion}"

                    // Exit if Docker is not installed
                    if (!dockerVersion.contains("Docker")) {
                        error "Docker is not installed on the Jenkins agent."
                    }

                    // Exit if Docker Compose is not installed
                    if (!composeVersion.contains("docker-compose")) {
                        error "Docker Compose is not installed on the Jenkins agent."
                    }
                }
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
                    // Docker login to Docker Hub using stored credentials
                    withCredentials([usernamePassword(credentialsId: 'your-docker-hub-credentials-id', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                    }
                    
                    // Push client and server images to Docker Hub
                    sh 'docker push ${CLIENT_IMAGE}'
                    sh 'docker push ${SERVER_IMAGE}'

                    // Tag and push images as "latest"
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
                    // Check if docker-compose command exists and run
                    if (isUnix()) {
                        sh 'docker-compose down || true'
                        sh 'docker-compose up -d --build'
                    } else {
                        bat 'docker-compose down || true'
                        bat 'docker-compose up -d --build'
                    }
                }
            }
        }

        stage('Check Running Containers') {
            steps {
                sh 'docker ps'  // Verify containers are running
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
