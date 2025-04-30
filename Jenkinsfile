pipeline {
    agent {
        docker {
            image 'node:16-alpine' 
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }
    
    environment {
        DOCKER_REGISTRY = 'your-registry-url' // Update with your Docker registry
        CLIENT_IMAGE = "${DOCKER_REGISTRY}/client:${env.BUILD_NUMBER}"
        SERVER_IMAGE = "${DOCKER_REGISTRY}/server:${env.BUILD_NUMBER}"
    }
    
    stages {
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
                            sh 'npm test -- --watchAll=false'
                        }
                    }
                }
                stage('Server Tests') {
                    steps {
                        dir('server') {
                            sh 'npm test'
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
                withCredentials([string(credentialsId: 'docker-registry-credentials', variable: 'DOCKER_AUTH')]) {
                    sh 'echo $DOCKER_AUTH | docker login -u username --password-stdin ${DOCKER_REGISTRY}'
                    sh 'docker push ${CLIENT_IMAGE}'
                    sh 'docker push ${SERVER_IMAGE}'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'docker-compose -f docker-compose.yml up -d'
            }
        }
    }
    
    post {
        always {
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