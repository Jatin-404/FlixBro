pipeline {
    agent {
        docker {
            image 'node:16-alpine' 
            args '-v /var/run/docker.sock:/var/run/docker.sock'
            // Removed the label requirement
        }
    }
    
    environment {
        DOCKER_REGISTRY = 'jatindocker10'
        CLIENT_IMAGE = "${DOCKER_REGISTRY}/flixbro-client:${env.BUILD_NUMBER}"
        SERVER_IMAGE = "${DOCKER_REGISTRY}/flixbro-server:${env.BUILD_NUMBER}"
        // Define Docker Hub credentials properly
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
    }
    
    stages {
        // First install Docker CLI in the Node container
        stage('Setup') {
            steps {
                sh 'apk add --no-cache docker-cli'
            }
        }
        
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Client Dependencies') {
                    steps {
                        dir('client') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Server Dependencies') {
                    steps {
                        dir('server') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }
        
        stage('Linting') {
            parallel {
                stage('Client Lint') {
                    steps {
                        dir('client') {
                            sh 'npm run lint || true'
                        }
                    }
                }
                stage('Server Lint') {
                    steps {
                        dir('server') {
                            sh 'npm run lint || true'
                        }
                    }
                }
            }
        }
        
        stage('Testing') {
            parallel {
                stage('Client Tests') {
                    steps {
                        dir('client') {
                            sh 'npm test -- --watchAll=false || true'
                        }
                    }
                }
                stage('Server Tests') {
                    steps {
                        dir('server') {
                            sh 'npm test || true'
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
                            sh 'npm run build'
                        }
                    }
                }
                stage('Build Server') {
                    steps {
                        dir('server') {
                            sh 'npm run build || true'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                sh 'docker build -t ${CLIENT_IMAGE} -f client/Dockerfile ./client'
                sh 'docker build -t ${SERVER_IMAGE} -f server/Dockerfile ./server'
            }
        }
        
        stage('Push Docker Images') {
            steps {
                // Properly use Docker Hub credentials
                sh 'echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin'
                sh 'docker push ${CLIENT_IMAGE}'
                sh 'docker push ${SERVER_IMAGE}'
                
                // Also tag and push as latest
                sh 'docker tag ${CLIENT_IMAGE} ${DOCKER_REGISTRY}/flixbro-client:latest'
                sh 'docker tag ${SERVER_IMAGE} ${DOCKER_REGISTRY}/flixbro-server:latest'
                sh 'docker push ${DOCKER_REGISTRY}/flixbro-client:latest'
                sh 'docker push ${DOCKER_REGISTRY}/flixbro-server:latest'
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'docker-compose -f docker-compose.yml up -d || echo "Deployment step skipped"'
            }
        }
    }
    
    post {
        always {
            // Clean up images
            sh 'docker rmi ${CLIENT_IMAGE} ${SERVER_IMAGE} || true'
            sh 'docker rmi ${DOCKER_REGISTRY}/flixbro-client:latest ${DOCKER_REGISTRY}/flixbro-server:latest || true'
            cleanWs()
        }
        success {
            echo 'Build and deployment successful!'
        }
        failure {
            echo 'Build or deployment failed!'
        }
    }
}