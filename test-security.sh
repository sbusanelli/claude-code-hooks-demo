#!/bin/bash

# Security Testing Script for Nginx Reverse Proxy

echo "🔒 Testing Nginx Security Configuration..."

BASE_URL="http://localhost"
API_URL="${BASE_URL}/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_health() {
    echo -e "\n${YELLOW}🏥 Testing Health Endpoints${NC}"
    
    # Test Nginx health
    response=$(curl -s -w "%{http_code}" -o /dev/null "${BASE_URL}/health")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Nginx health check passed${NC}"
    else
        echo -e "${RED}❌ Nginx health check failed (HTTP $response)${NC}"
    fi
    
    # Test API health
    response=$(curl -s -w "%{http_code}" -o /dev/null "${API_URL}/health")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ MCP server health check passed${NC}"
    else
        echo -e "${RED}❌ MCP server health check failed (HTTP $response)${NC}"
    fi
}

test_rate_limiting() {
    echo -e "\n${YELLOW}⚡ Testing Rate Limiting${NC}"
    
    echo "Testing login rate limiting (should fail after 3 attempts)..."
    success_count=0
    
    for i in {1..5}; do
        response=$(curl -s -w "%{http_code}" -o /dev/null -X POST \
            "${API_URL}/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"username":"admin","password":"wrong"}')
        
        if [ "$response" = "401" ]; then
            success_count=$((success_count + 1))
        elif [ "$response" = "429" ]; then
            echo -e "${GREEN}✅ Rate limiting activated after $i attempts${NC}"
            break
        fi
        
        sleep 0.1
    done
    
    if [ $success_count -ge 3 ]; then
        echo -e "${GREEN}✅ Rate limiting working ($success_count successful attempts)${NC}"
    else
        echo -e "${RED}❌ Rate limiting may not be working properly${NC}"
    fi
}

test_security_headers() {
    echo -e "\n${YELLOW}🛡️ Testing Security Headers${NC}"
    
    # Get headers
    headers=$(curl -s -I "${BASE_URL}/")
    
    # Check for security headers
    security_headers=(
        "X-Frame-Options"
        "X-XSS-Protection"
        "X-Content-Type-Options"
        "Referrer-Policy"
        "Content-Security-Policy"
    )
    
    for header in "${security_headers[@]}"; do
        if echo "$headers" | grep -qi "$header"; then
            echo -e "${GREEN}✅ $header header present${NC}"
        else
            echo -e "${RED}❌ $header header missing${NC}"
        fi
    done
}

test_request_filtering() {
    echo -e "\n${YELLOW}🚫 Testing Request Filtering${NC}"
    
    # Test blocked file extensions
    blocked_files=(
        "config.php"
        "admin.asp"
        "script.jsp"
        "malicious.cgi"
        ".env"
        "database.log"
        "server.conf"
        "private.key"
        ".htaccess"
    )
    
    for file in "${blocked_files[@]}"; do
        response=$(curl -s -w "%{http_code}" -o /dev/null "${BASE_URL}/$file")
        if [ "$response" = "403" ] || [ "$response" = "404" ]; then
            echo -e "${GREEN}✅ $file blocked (HTTP $response)${NC}"
        else
            echo -e "${RED}❌ $file not blocked (HTTP $response)${NC}"
        fi
    done
}

test_authentication() {
    echo -e "\n${YELLOW}🔐 Testing Authentication${NC}"
    
    # Test valid login
    response=$(curl -s -w "%{http_code}" -o /tmp/login_response.json -X POST \
        "${API_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}')
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ Valid login successful${NC}"
        
        # Extract token
        token=$(grep -o '"token":"[^"]*"' /tmp/login_response.json | cut -d'"' -f4)
        
        if [ -n "$token" ]; then
            # Test authenticated request
            response=$(curl -s -w "%{http_code}" -o /dev/null \
                -H "Authorization: Bearer $token" \
                "${API_URL}/users")
            
            if [ "$response" = "200" ]; then
                echo -e "${GREEN}✅ Authenticated request successful${NC}"
            else
                echo -e "${RED}❌ Authenticated request failed (HTTP $response)${NC}"
            fi
        else
            echo -e "${RED}❌ No token received in login response${NC}"
        fi
    else
        echo -e "${RED}❌ Valid login failed (HTTP $response)${NC}"
    fi
    
    # Test unauthenticated request
    response=$(curl -s -w "%{http_code}" -o /dev/null "${API_URL}/users")
    if [ "$response" = "401" ]; then
        echo -e "${GREEN}✅ Unauthenticated request properly blocked${NC}"
    else
        echo -e "${RED}❌ Unauthenticated request not blocked (HTTP $response)${NC}"
    fi
}

test_cors() {
    echo -e "\n${YELLOW}🌐 Testing CORS${NC}"
    
    # Test OPTIONS request
    response=$(curl -s -w "%{http_code}" -o /dev/null -X OPTIONS \
        -H "Origin: http://localhost:4200" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        "${API_URL}/users")
    
    if [ "$response" = "204" ] || [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ CORS preflight request successful${NC}"
    else
        echo -e "${RED}❌ CORS preflight request failed (HTTP $response)${NC}"
    fi
}

# Main execution
echo "🔒 Starting Security Tests for Nginx Reverse Proxy"
echo "=================================================="

# Check if services are running
if ! curl -s "${BASE_URL}/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Services are not running. Please start with: docker-compose up -d${NC}"
    exit 1
fi

# Run all tests
test_health
test_security_headers
test_rate_limiting
test_request_filtering
test_authentication
test_cors

echo -e "\n${GREEN}🎉 Security testing completed!${NC}"
echo "Check the results above for any issues that need attention."
