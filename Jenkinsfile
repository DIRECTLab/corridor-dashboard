pipeline {
    agent {
        node { label 'temp' }
    }

    environment {
        REGISTRY_URL = "harbor.aspire-computing.com"
        REGISTRY_PROJECT = "library"
        IMAGE_NAME = "freight-electrification-explorer"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        HELM_RELEASE = "freight-electrification-explorer"
        NAMESPACE = "default"
        HELM_CHART_PATH = "./helm/"
    }

    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                    docker build -t ${REGISTRY_URL}/${REGISTRY_PROJECT}/${IMAGE_NAME}:${IMAGE_TAG} .
                    """
                }
            }
        }
       
        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'harbor-creds-max', usernameVariable: 'HARBOR_USER', passwordVariable: 'HARBOR_PASS')]) {
                    sh """
                    echo "$HARBOR_PASS" | docker login ${REGISTRY_URL} -u "$HARBOR_USER" --password-stdin
                    docker push ${REGISTRY_URL}/${REGISTRY_PROJECT}/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }
       
        stage('Deploy with Helm') {
            steps {
                withKubeConfig([credentialsId: 'kubernetes-cluster-access-file', serverUrl: 'https://k8s.aspire-computing.com:6443']) {
                    sh """
                        helm upgrade --install ${HELM_RELEASE} ${HELM_CHART_PATH} \
                        --set freightEv.tag=${IMAGE_TAG} \
                        --namespace=${NAMESPACE}
                        """
                }
            }
        }
    }

    post {
        always {
            script {
                def registry = env.REGISTRY_URL ?: "harbor.aspire-computing.com"
                sh "docker logout ${registry} || true"
            }
        }
    }
}

