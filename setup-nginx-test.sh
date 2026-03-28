#!/bin/bash

# Simple Nginx Test Setup (without Docker)

echo "🚀 Setting up Nginx Reverse Proxy Test..."

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx is not installed. Please install Nginx:"
    echo "  macOS: brew install nginx"
    echo "  Ubuntu: sudo apt-get install nginx"
    exit 1
fi

# Create necessary directories
mkdir -p nginx/logs nginx/conf.d nginx/ssl

# Check if MCP server is running
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "❌ MCP server is not running on port 3001"
    echo "Please start it with: cd mcp-server && node dist/http-server.js"
    exit 1
fi

# Check if Angular app is running
if ! curl -s http://localhost:4200 > /dev/null 2>&1; then
    echo "❌ Angular app is not running on port 4200"
    echo "Please start it with: cd angular && npm start"
    exit 1
fi

echo "✅ Both services are running!"

# Test Nginx configuration syntax
echo "🔍 Testing Nginx configuration..."
nginx -t -c $(pwd)/nginx/nginx.conf

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Create a simple test configuration for local testing
    cat > nginx/local-test.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    upstream angular_backend {
        server 127.0.0.1:4200;
    }

    upstream mcp_backend {
        server 127.0.0.1:3001;
    }

    server {
        listen 8080;
        server_name localhost;

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Angular app
        location / {
            proxy_pass http://angular_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            limit_req zone=api burst=20 nodelay;
        }

        # API routes
        location /api/ {
            proxy_pass http://mcp_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            limit_req zone=api burst=10 nodelay;
        }

        # Auth endpoints with strict rate limiting
        location /api/auth/login {
            proxy_pass http://mcp_backend/auth/login;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            limit_req zone=login burst=5 nodelay;
        }

        # Block dangerous files
        location ~* \.(php|asp|jsp|cgi|env|log|conf|key|pem|crt)$ {
            deny all;
        }

        location ~ /\. {
            deny all;
        }
    }
}
EOF

    echo "🚀 Starting Nginx on port 8080..."
    nginx -c $(pwd)/nginx/local-test.conf
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx started successfully!"
        echo ""
        echo "🧪 Test the reverse proxy:"
        echo "  Health check: http://localhost:8080/health"
        echo "  Angular app: http://localhost:8080/"
        echo "  API health: http://localhost:8080/api/health"
        echo "  Login test: curl -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"
        echo ""
        echo "🛑 Stop Nginx with: nginx -s quit"
        echo "📊 View logs: tail -f /var/log/nginx/access.log"
        
        # Run basic tests
        echo -e "\n🧪 Running basic tests..."
        
        # Test health endpoint
        if curl -s http://localhost:8080/health | grep -q "healthy"; then
            echo "✅ Nginx health check working"
        else
            echo "❌ Nginx health check failed"
        fi
        
        # Test API proxy
        if curl -s http://localhost:8080/api/health | grep -q "healthy"; then
            echo "✅ API proxy working"
        else
            echo "❌ API proxy failed"
        fi
        
        # Test rate limiting
        echo -e "\n⚡ Testing rate limiting (5 rapid login attempts)..."
        blocked=0
        for i in {1..5}; do
            response=$(curl -s -w "%{http_code}" -o /dev/null -X POST \
                http://localhost:8080/api/auth/login \
                -H "Content-Type: application/json" \
                -d '{"username":"admin","password":"wrong"}')
            
            if [ "$response" = "429" ]; then
                blocked=1
                echo "✅ Rate limiting activated after $i attempts"
                break
            fi
            sleep 0.1
        done
        
        if [ $blocked -eq 0 ]; then
            echo "⚠️  Rate limiting may not be fully active (needs more requests)"
        fi
        
    else
        echo "❌ Failed to start Nginx"
        exit 1
    fi
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi
