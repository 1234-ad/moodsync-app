#!/bin/bash

# MoodSync Development Environment Setup Script
# This script sets up the complete development environment for MoodSync

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_NODE="16.0.0"
        if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE" ]; then
            log_success "Node.js $NODE_VERSION is installed"
        else
            log_error "Node.js version $REQUIRED_NODE or higher is required. Current: $NODE_VERSION"
            exit 1
        fi
    else
        log_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        log_success "npm $NPM_VERSION is installed"
    else
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check Docker
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        log_success "Docker $DOCKER_VERSION is installed"
    else
        log_warning "Docker is not installed. Some features may not work."
    fi
    
    # Check Docker Compose
    if command_exists docker-compose; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        log_success "Docker Compose $COMPOSE_VERSION is installed"
    else
        log_warning "Docker Compose is not installed. Some features may not work."
    fi
    
    # Check Python (for AI models)
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        log_success "Python $PYTHON_VERSION is installed"
    else
        log_warning "Python 3 is not installed. AI model training may not work."
    fi
    
    # Check Git
    if command_exists git; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        log_success "Git $GIT_VERSION is installed"
    else
        log_error "Git is not installed"
        exit 1
    fi
}

# Create directory structure
create_directories() {
    log_info "Creating directory structure..."
    
    directories=(
        "services/auth"
        "services/mood"
        "services/music"
        "services/environment"
        "services/analytics"
        "services/notification"
        "web/src"
        "admin/src"
        "mobile/src"
        "models/tensorflow"
        "models/pytorch"
        "data/training"
        "data/test"
        "scripts/deployment"
        "scripts/migration"
        "scripts/backup"
        "monitoring/prometheus"
        "monitoring/grafana/dashboards"
        "monitoring/grafana/provisioning"
        "monitoring/logstash/pipeline"
        "monitoring/logstash/config"
        "nginx"
        "ssl"
        "logs"
        "backups"
        "docs/api"
        "docs/deployment"
        "docs/user-guide"
        "tests/unit"
        "tests/integration"
        "tests/e2e"
        "kubernetes/development"
        "kubernetes/staging"
        "kubernetes/production"
        "terraform/aws"
        "terraform/gcp"
        "terraform/azure"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        log_success "Created directory: $dir"
    done
}

# Install dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    
    # Install root dependencies
    if [ -f "package.json" ]; then
        log_info "Installing root dependencies..."
        npm install
        log_success "Root dependencies installed"
    fi
    
    # Install service dependencies
    services=("auth" "mood" "music" "environment" "analytics" "notification")
    for service in "${services[@]}"; do
        if [ -f "services/$service/package.json" ]; then
            log_info "Installing dependencies for $service service..."
            cd "services/$service"
            npm install
            cd "../.."
            log_success "$service service dependencies installed"
        fi
    done
    
    # Install web dependencies
    if [ -f "web/package.json" ]; then
        log_info "Installing web portal dependencies..."
        cd web
        npm install
        cd ..
        log_success "Web portal dependencies installed"
    fi
    
    # Install admin dependencies
    if [ -f "admin/package.json" ]; then
        log_info "Installing admin panel dependencies..."
        cd admin
        npm install
        cd ..
        log_success "Admin panel dependencies installed"
    fi
    
    # Install mobile dependencies
    if [ -f "mobile/package.json" ]; then
        log_info "Installing mobile app dependencies..."
        cd mobile
        npm install
        cd ..
        log_success "Mobile app dependencies installed"
    fi
}

# Setup environment files
setup_environment() {
    log_info "Setting up environment files..."
    
    # Copy environment templates
    if [ -f ".env.example" ] && [ ! -f ".env" ]; then
        cp .env.example .env
        log_success "Created .env file from template"
        log_warning "Please update .env file with your configuration"
    fi
    
    # Setup service environment files
    services=("auth" "mood" "music" "environment" "analytics" "notification")
    for service in "${services[@]}"; do
        if [ -f "services/$service/.env.example" ] && [ ! -f "services/$service/.env" ]; then
            cp "services/$service/.env.example" "services/$service/.env"
            log_success "Created .env file for $service service"
        fi
    done
    
    # Setup web environment
    if [ -f "web/.env.example" ] && [ ! -f "web/.env" ]; then
        cp web/.env.example web/.env
        log_success "Created .env file for web portal"
    fi
    
    # Setup admin environment
    if [ -f "admin/.env.example" ] && [ ! -f "admin/.env" ]; then
        cp admin/.env.example admin/.env
        log_success "Created .env file for admin panel"
    fi
}

# Setup databases
setup_databases() {
    log_info "Setting up databases..."
    
    if command_exists docker-compose; then
        log_info "Starting database containers..."
        docker-compose up -d mongodb postgres redis influxdb
        
        # Wait for databases to be ready
        log_info "Waiting for databases to be ready..."
        sleep 30
        
        # Initialize MongoDB replica set
        log_info "Initializing MongoDB replica set..."
        docker-compose exec mongodb mongosh --eval "rs.initiate()"
        
        # Run database migrations
        log_info "Running database migrations..."
        npm run migrate
        
        log_success "Databases setup completed"
    else
        log_warning "Docker Compose not available. Please setup databases manually."
    fi
}

# Setup AI models
setup_ai_models() {
    log_info "Setting up AI models..."
    
    # Create models directory
    mkdir -p models/downloads
    
    # Download pre-trained models (mock URLs - replace with actual model URLs)
    models=(
        "https://cdn.moodsync.ai/models/facial-emotion-v3.json:models/tensorflow/facial-emotion.json"
        "https://cdn.moodsync.ai/models/voice-emotion-v2.json:models/tensorflow/voice-emotion.json"
        "https://cdn.moodsync.ai/models/text-sentiment-bert.json:models/tensorflow/text-sentiment.json"
        "https://cdn.moodsync.ai/models/emotion-fusion-v4.json:models/tensorflow/emotion-fusion.json"
        "https://cdn.moodsync.ai/models/music-recommender-v3.json:models/tensorflow/music-recommender.json"
        "https://cdn.moodsync.ai/models/audio-analyzer-v2.json:models/tensorflow/audio-analyzer.json"
    )
    
    for model in "${models[@]}"; do
        url=$(echo "$model" | cut -d':' -f1)
        path=$(echo "$model" | cut -d':' -f2)
        
        if [ ! -f "$path" ]; then
            log_info "Downloading model: $(basename "$path")"
            # curl -L "$url" -o "$path" 2>/dev/null || log_warning "Failed to download $path"
            # Create placeholder files for now
            echo '{"model": "placeholder"}' > "$path"
            log_success "Model placeholder created: $path"
        fi
    done
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring stack..."
    
    # Create Prometheus configuration
    cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'moodsync-services'
    static_configs:
      - targets: ['auth-service:3001', 'mood-service:3002', 'music-service:3003']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'mongodb-exporter'
    static_configs:
      - targets: ['mongodb-exporter:9216']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
EOF
    
    # Create Grafana provisioning
    mkdir -p monitoring/grafana/provisioning/datasources
    mkdir -p monitoring/grafana/provisioning/dashboards
    
    cat > monitoring/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF
    
    log_success "Monitoring configuration created"
}

# Setup SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        log_info "Generating self-signed SSL certificates..."
        mkdir -p ssl
        
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
            -subj "/C=US/ST=CA/L=San Francisco/O=MoodSync/CN=localhost" 2>/dev/null || {
            log_warning "Failed to generate SSL certificates. OpenSSL may not be installed."
        }
        
        if [ -f "ssl/cert.pem" ]; then
            log_success "SSL certificates generated"
        fi
    else
        log_success "SSL certificates already exist"
    fi
}

# Setup Git hooks
setup_git_hooks() {
    log_info "Setting up Git hooks..."
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for MoodSync

echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the issues before committing."
    exit 1
fi

# Run tests
npm run test:unit
if [ $? -ne 0 ]; then
    echo "Tests failed. Please fix the issues before committing."
    exit 1
fi

echo "Pre-commit checks passed!"
EOF
    
    chmod +x .git/hooks/pre-commit
    
    # Pre-push hook
    cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
# Pre-push hook for MoodSync

echo "Running pre-push checks..."

# Run integration tests
npm run test:integration
if [ $? -ne 0 ]; then
    echo "Integration tests failed. Please fix the issues before pushing."
    exit 1
fi

echo "Pre-push checks passed!"
EOF
    
    chmod +x .git/hooks/pre-push
    
    log_success "Git hooks setup completed"
}

# Create development scripts
create_dev_scripts() {
    log_info "Creating development scripts..."
    
    # Start development script
    cat > scripts/dev-start.sh << 'EOF'
#!/bin/bash
# Start MoodSync development environment

echo "Starting MoodSync development environment..."

# Start databases
docker-compose up -d mongodb postgres redis influxdb

# Wait for databases
sleep 10

# Start services in parallel
npm run dev:auth &
npm run dev:mood &
npm run dev:music &
npm run dev:environment &
npm run dev:analytics &
npm run dev:notification &

# Start web portal
npm run dev:web &

# Start admin panel
npm run dev:admin &

echo "All services started! Check logs for any issues."
echo "Web Portal: http://localhost:3000"
echo "Admin Panel: http://localhost:3007"
echo "API Gateway: http://localhost:8000"

wait
EOF
    
    chmod +x scripts/dev-start.sh
    
    # Stop development script
    cat > scripts/dev-stop.sh << 'EOF'
#!/bin/bash
# Stop MoodSync development environment

echo "Stopping MoodSync development environment..."

# Kill all node processes
pkill -f "node.*moodsync"

# Stop Docker containers
docker-compose down

echo "Development environment stopped."
EOF
    
    chmod +x scripts/dev-stop.sh
    
    # Database reset script
    cat > scripts/reset-db.sh << 'EOF'
#!/bin/bash
# Reset MoodSync databases

echo "Resetting MoodSync databases..."

# Stop containers
docker-compose down

# Remove volumes
docker volume rm moodsync-app_mongodb_data 2>/dev/null || true
docker volume rm moodsync-app_postgres_data 2>/dev/null || true
docker volume rm moodsync-app_redis_data 2>/dev/null || true
docker volume rm moodsync-app_influxdb_data 2>/dev/null || true

# Start containers
docker-compose up -d mongodb postgres redis influxdb

# Wait for databases
sleep 30

# Initialize MongoDB replica set
docker-compose exec mongodb mongosh --eval "rs.initiate()"

# Run migrations
npm run migrate

echo "Databases reset completed."
EOF
    
    chmod +x scripts/reset-db.sh
    
    log_success "Development scripts created"
}

# Setup testing environment
setup_testing() {
    log_info "Setting up testing environment..."
    
    # Create test configuration
    cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    'services/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/**/*.test.{js,ts}',
    '**/__tests__/**/*.{js,ts}'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000
};
EOF
    
    # Create test setup file
    mkdir -p tests
    cat > tests/setup.js << 'EOF'
// Global test setup
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
});

afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
});
EOF
    
    log_success "Testing environment setup completed"
}

# Generate documentation
generate_docs() {
    log_info "Generating documentation..."
    
    # Create README files for services
    services=("auth" "mood" "music" "environment" "analytics" "notification")
    for service in "${services[@]}"; do
        if [ ! -f "services/$service/README.md" ]; then
            cat > "services/$service/README.md" << EOF
# MoodSync ${service^} Service

## Overview
The ${service} service handles ${service}-related functionality for the MoodSync platform.

## Installation
\`\`\`bash
npm install
\`\`\`

## Configuration
Copy \`.env.example\` to \`.env\` and configure the required environment variables.

## Development
\`\`\`bash
npm run dev
\`\`\`

## Testing
\`\`\`bash
npm test
\`\`\`

## API Documentation
See the main API documentation for detailed endpoint information.
EOF
            log_success "Created README for $service service"
        fi
    done
    
    # Create deployment guide
    cat > docs/deployment/DEPLOYMENT.md << 'EOF'
# MoodSync Deployment Guide

## Prerequisites
- Docker and Docker Compose
- Kubernetes cluster (for production)
- SSL certificates
- Environment variables configured

## Development Deployment
```bash
docker-compose up -d
```

## Production Deployment
```bash
kubectl apply -f kubernetes/production/
```

## Environment Variables
See `.env.example` for required environment variables.

## Monitoring
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3008
- Kibana: http://localhost:5601

## Troubleshooting
Common issues and solutions...
EOF
    
    log_success "Documentation generated"
}

# Main setup function
main() {
    log_info "Starting MoodSync development environment setup..."
    
    check_requirements
    create_directories
    install_dependencies
    setup_environment
    setup_databases
    setup_ai_models
    setup_monitoring
    setup_ssl
    setup_git_hooks
    create_dev_scripts
    setup_testing
    generate_docs
    
    log_success "MoodSync development environment setup completed!"
    
    echo ""
    echo "Next steps:"
    echo "1. Update .env files with your configuration"
    echo "2. Run 'scripts/dev-start.sh' to start the development environment"
    echo "3. Visit http://localhost:3000 for the web portal"
    echo "4. Visit http://localhost:3007 for the admin panel"
    echo "5. Check the documentation in the docs/ directory"
    echo ""
    echo "For help, visit: https://docs.moodsync.ai"
}

# Run main function
main "$@"