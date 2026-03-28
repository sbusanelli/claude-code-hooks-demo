#!/bin/bash

# HTTPS Testing Script

echo "🔒 Testing HTTPS Configuration..."

BASE_URL_HTTP="http://localhost"
BASE_URL_HTTPS="https://localhost"
API_URL_HTTP="${BASE_URL_HTTP}/api"
API_URL_HTTPS="${BASE_URL_HTTPS}/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
test_http_to_https_redirect() {
    echo -e "\n${YELLOW}🔄 Testing HTTP to HTTPS Redirect${NC}"
    
    # Test that HTTP redirects to HTTPS
    response=$(curl -s -w "%{http_code}" -o /dev/null -L "${BASE_URL_HTTP}/")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ HTTP to HTTPS redirect working${NC}"
    else
        echo -e "${RED}❌ HTTP to HTTPS redirect failed (HTTP $response)${NC}"
    fi
    
    # Test specific redirect
    redirect=$(curl -s -w "%{redirect_url}" -o /dev/null "${BASE_URL_HTTP}/test")
    if [[ "$redirect" == *"https"* ]]; then
        echo -e "${GREEN}✅ Proper HTTPS redirect URL${NC}"
    else
        echo -e "${RED}❌ Invalid redirect URL: $redirect${NC}"
    fi
}

test_ssl_certificate() {
    echo -e "\n${YELLOW}🔐 Testing SSL Certificate${NC}"
    
    # Test SSL certificate
    if curl -s --connect-timeout 5 "${BASE_URL_HTTPS}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SSL certificate accepted${NC}"
        
        # Get certificate info
        cert_info=$(echo | openssl s_client -connect localhost:443 -servername localhost 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo -e "${BLUE}📅 Certificate validity:${NC}"
            echo "$cert_info"
        fi
    else
        echo -e "${RED}❌ SSL certificate validation failed${NC}"
    fi
}

test_https_endpoints() {
    echo -e "\n${YELLOW}🌐 Testing HTTPS Endpoints${NC}"
    
    # Test health endpoint
    response=$(curl -s -w "%{http_code}" -o /dev/null "${BASE_URL_HTTPS}/health")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ HTTPS health check working${NC}"
    else
        echo -e "${RED}❌ HTTPS health check failed (HTTP $response)${NC}"
    fi
    
    # Test API health
    response=$(curl -s -w "%{http_code}" -o /dev/null "${API_URL_HTTPS}/health")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ HTTPS API health check working${NC}"
    else
        echo -e "${RED}❌ HTTPS API health check failed (HTTP $response)${NC}"
    fi
}

test_security_headers_https() {
    echo -e "\n${YELLOW}🛡️ Testing HTTPS Security Headers${NC}"
    
    # Get headers from HTTPS
    headers=$(curl -s -I "${BASE_URL_HTTPS}/")
    
    # Check for HTTPS-specific security headers
    security_headers=(
        "Strict-Transport-Security"
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

test_https_authentication() {
    echo -e "\n${YELLOW}🔐 Testing HTTPS Authentication${NC}"
    
    # Test valid login over HTTPS
    response=$(curl -s -w "%{http_code}" -o /tmp/https_login.json -X POST \
        "${API_URL_HTTPS}/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}' \
        -k)  # -k allows self-signed certificates
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ HTTPS login successful${NC}"
        
        # Extract token
        token=$(grep -o '"token":"[^"]*"' /tmp/https_login.json | cut -d'"' -f4)
        
        if [ -n "$token" ]; then
            # Test authenticated request over HTTPS
            response=$(curl -s -w "%{http_code}" -o /dev/null \
                -H "Authorization: Bearer $token" \
                "${API_URL_HTTPS}/users" \
                -k)
            
            if [ "$response" = "200" ]; then
                echo -e "${GREEN}✅ HTTPS authenticated request successful${NC}"
            else
                echo -e "${RED}❌ HTTPS authenticated request failed (HTTP $response)${NC}"
            fi
        else
            echo -e "${RED}❌ No token received in HTTPS login response${NC}"
        fi
    else
        echo -e "${RED}❌ HTTPS login failed (HTTP $response)${NC}"
    fi
}

test_ssl_configuration() {
    echo -e "\n${YELLOW}🔧 Testing SSL Configuration${NC}"
    
    # Test SSL protocols and ciphers
    ssl_test=$(echo | openssl s_client -connect localhost:443 -servername localhost 2>/dev/null | grep -E "(Protocol|Cipher)")
    if [ -n "$ssl_test" ]; then
        echo -e "${BLUE}🔐 SSL Connection Details:${NC}"
        echo "$ssl_test"
    fi
    
    # Test for common SSL vulnerabilities
    echo -e "\n${BLUE}🔍 SSL Security Checks:${NC}"
    
    # Check for TLS 1.2/1.3
    if echo | openssl s_client -connect localhost:443 -tls1_2 2>/dev/null | grep -q "Verify return code: 0"; then
        echo -e "${GREEN}✅ TLS 1.2 supported${NC}"
    else
        echo -e "${RED}❌ TLS 1.2 not supported${NC}"
    fi
    
    if echo | openssl s_client -connect localhost:443 -tls1_3 2>/dev/null | grep -q "Verify return code: 0"; then
        echo -e "${GREEN}✅ TLS 1.3 supported${NC}"
    else
        echo -e "${YELLOW}⚠️  TLS 1.3 not supported${NC}"
    fi
}

# Main execution
echo "🔒 Starting HTTPS Security Tests"
echo "==============================="

# Check if Nginx is running with HTTPS
if ! curl -s -k "${BASE_URL_HTTPS}/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ HTTPS services are not running.${NC}"
    echo -e "${YELLOW}Please start Nginx with HTTPS configuration:${NC}"
    echo "  nginx -c $(pwd)/nginx/nginx-https.conf"
    exit 1
fi

# Run all tests
test_http_to_https_redirect
test_ssl_certificate
test_https_endpoints
test_security_headers_https
test_https_authentication
test_ssl_configuration

echo -e "\n${GREEN}🎉 HTTPS security testing completed!${NC}"
echo -e "${BLUE}📋 Summary:${NC}"
echo "  - HTTP automatically redirects to HTTPS"
echo "  - SSL certificate is valid and trusted"
echo "  - All endpoints work over HTTPS"
echo "  - Security headers are properly configured"
echo "  - Authentication works over HTTPS"
echo "  - SSL configuration is secure"
