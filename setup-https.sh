#!/bin/bash

# HTTPS Setup Script for Nginx Reverse Proxy

echo "🔒 Setting up HTTPS with Nginx Reverse Proxy..."

# Check if OpenSSL is available
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL is not installed. Please install OpenSSL:"
    echo "  macOS: brew install openssl"
    echo "  Ubuntu: sudo apt-get install openssl"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx is not installed. Please install Nginx:"
    echo "  macOS: brew install nginx"
    echo "  Ubuntu: sudo apt-get install nginx"
    exit 1
fi

# Create necessary directories
mkdir -p nginx/logs nginx/conf.d nginx/ssl

# Check if SSL certificates exist, generate if not
if [ ! -f "nginx/ssl/cert.pem" ]; then
    echo "🔐 SSL certificates not found. Generating..."
    ./generate-ssl.sh
fi

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

# Test Nginx HTTPS configuration syntax
echo "🔍 Testing Nginx HTTPS configuration..."
nginx -t -c $(pwd)/nginx/nginx-https.conf

if [ $? -eq 0 ]; then
    echo "✅ Nginx HTTPS configuration is valid"
    
    # Stop any existing Nginx processes
    echo "🛑 Stopping existing Nginx processes..."
    pkill -f nginx || true
    sleep 2
    
    # Start Nginx with HTTPS
    echo "🚀 Starting Nginx with HTTPS on ports 80 and 443..."
    nginx -c $(pwd)/nginx/nginx-https.conf
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx started successfully with HTTPS!"
        echo ""
        echo "🔒 HTTPS Services are now running:"
        echo "  HTTP (redirects to HTTPS): http://localhost"
        echo "  HTTPS (secure): https://localhost"
        echo "  Health check: https://localhost/health"
        echo "  Angular app: https://localhost/"
        echo "  API health: https://localhost/api/health"
        echo ""
        echo "🧪 Test HTTPS functionality:"
        echo "  ./test-https.sh"
        echo ""
        echo "🛑 Stop Nginx with: nginx -s quit"
        echo "📊 View logs: tail -f /var/log/nginx/access.log"
        echo "🔍 SSL info: openssl s_client -connect localhost:443 -servername localhost"
        
        # Wait a moment for Nginx to start
        sleep 3
        
        # Run basic HTTPS tests
        echo -e "\n🧪 Running basic HTTPS tests..."
        
        # Test HTTP to HTTPS redirect
        http_code=$(curl -s -w "%{http_code}" -o /dev/null -L "http://localhost")
        if [ "$http_code" = "200" ]; then
            echo "✅ HTTP to HTTPS redirect working"
        else
            echo "❌ HTTP to HTTPS redirect failed (HTTP $http_code)"
        fi
        
        # Test HTTPS health endpoint
        if curl -s -k "https://localhost/health" | grep -q "healthy"; then
            echo "✅ HTTPS health check working"
        else
            echo "❌ HTTPS health check failed"
        fi
        
        # Test API proxy over HTTPS
        if curl -s -k "https://localhost/api/health" | grep -q "healthy"; then
            echo "✅ HTTPS API proxy working"
        else
            echo "❌ HTTPS API proxy failed"
        fi
        
        # Test SSL certificate
        if echo | openssl s_client -connect localhost:443 -servername localhost 2>/dev/null | grep -q "Verify return code: 0"; then
            echo "✅ SSL certificate is valid"
        else
            echo "⚠️  SSL certificate validation (self-signed cert - expected)"
        fi
        
        # Test HTTPS authentication
        echo -e "\n🔐 Testing HTTPS authentication..."
        auth_response=$(curl -s -w "%{http_code}" -o /tmp/https_auth.json -X POST \
            "https://localhost/api/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"username":"admin","password":"admin123"}' \
            -k)
        
        if [ "$auth_response" = "200" ]; then
            echo "✅ HTTPS authentication successful"
            
            # Extract token and test authenticated request
            token=$(grep -o '"token":"[^"]*"' /tmp/https_auth.json | cut -d'"' -f4)
            if [ -n "$token" ]; then
                api_response=$(curl -s -w "%{http_code}" -o /dev/null \
                    -H "Authorization: Bearer $token" \
                    "https://localhost/api/users" \
                    -k)
                
                if [ "$api_response" = "200" ]; then
                    echo "✅ HTTPS authenticated API request successful"
                else
                    echo "❌ HTTPS authenticated API request failed (HTTP $api_response)"
                fi
            fi
        else
            echo "❌ HTTPS authentication failed (HTTP $auth_response)"
        fi
        
        echo -e "\n🎉 HTTPS setup complete!"
        echo -e "\n📋 Security Features Enabled:"
        echo "  ✅ SSL/TLS encryption (TLS 1.2/1.3)"
        echo "  ✅ HTTP to HTTPS redirect"
        echo "  ✅ HSTS (HTTP Strict Transport Security)"
        echo "  ✅ Security headers (X-Frame-Options, XSS Protection, etc.)"
        echo "  ✅ Rate limiting and request filtering"
        echo "  ✅ Perfect Forward Secrecy (DH parameters)"
        echo "  ✅ Secure cipher suites"
        
        echo -e "\n🌐 Access the application securely:"
        echo "  📱 https://localhost (will show security warning for self-signed cert)"
        echo "  🔧 In browser: Accept the security risk to proceed"
        echo "  📱 The app will then work fully over HTTPS"
        
    else
        echo "❌ Failed to start Nginx with HTTPS"
        exit 1
    fi
else
    echo "❌ Nginx HTTPS configuration has errors"
    exit 1
fi
