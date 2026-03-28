#!/bin/bash

# Prometheus Testing Script for MCP Server

echo "📊 Testing Prometheus Metrics Integration"

BASE_URL="http://localhost:3001"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}🔍 Testing Prometheus Metrics Endpoint${NC}"

# Test 1: Basic metrics availability
echo -e "\n${BLUE}1. Testing Metrics Endpoint Availability${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/metrics_response.txt "${BASE_URL}/metrics")

if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Metrics endpoint accessible (HTTP 200)${NC}"
    
    # Check if metrics have proper format
    if grep -q "# HELP" /tmp/metrics_response.txt; then
        echo -e "${GREEN}✅ Prometheus format detected${NC}"
    else
        echo -e "${RED}❌ Invalid Prometheus format${NC}"
    fi
else
    echo -e "${RED}❌ Metrics endpoint not accessible (HTTP $response)${NC}"
fi

# Test 2: Generate some traffic to test metrics
echo -e "\n${BLUE}2. Generating Traffic to Test Metrics${NC}"

# Test login attempts
echo -e "${YELLOW}   Testing login attempts...${NC}"
curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}' > /dev/null

curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' > /dev/null

# Test API requests
echo -e "${YELLOW}   Testing API requests...${NC}"
curl -s "${BASE_URL}/users" -H "Authorization: Bearer fake-token" > /dev/null

# Test user registration
echo -e "${YELLOW}   Testing user registration...${NC}"
curl -s -X POST "${BASE_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","email":"test@example.com","username":"testuser","password":"SecurePass123!"}' > /dev/null

# Wait a moment for metrics to update
sleep 2

# Test 3: Check updated metrics
echo -e "\n${BLUE}3. Checking Updated Metrics${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/updated_metrics.txt "${BASE_URL}/metrics")

if [ "$response" = "200" ]; then
    # Extract specific metrics (skip TYPE lines, get actual values)
    login_attempts=$(grep -A1 "user_login_attempts_total" /tmp/updated_metrics.txt | tail -1 | awk '{print $2}')
    login_success=$(grep -A1 "user_login_success_total" /tmp/updated_metrics.txt | tail -1 | awk '{print $2}')
    api_requests=$(grep -A1 "api_requests_total" /tmp/updated_metrics.txt | tail -1 | awk '{print $2}')
    user_registrations=$(grep -A1 "user_registrations_total" /tmp/updated_metrics.txt | tail -1 | awk '{print $2}')
    
    echo -e "${GREEN}✅ Updated metrics collected:${NC}"
    echo -e "${BLUE}   Login attempts: ${login_attempts}${NC}"
    echo -e "${BLUE}   Login success: ${login_success}${NC}"
    echo -e "${BLUE}   API requests: ${api_requests}${NC}"
    echo -e "${BLUE}   User registrations: ${user_registrations}${NC}"
    
    # Validate metrics are reasonable
    if [ "$login_attempts" -ge 2 ] && [ "$login_success" -ge 1 ]; then
        echo -e "${GREEN}✅ Login metrics working correctly${NC}"
    else
        echo -e "${RED}❌ Login metrics may not be working${NC}"
    fi
    
    if [ "$api_requests" -ge 1 ]; then
        echo -e "${GREEN}✅ API request metrics working${NC}"
    else
        echo -e "${RED}❌ API request metrics not working${NC}"
    fi
    
    if [ "$user_registrations" -ge 1 ]; then
        echo -e "${GREEN}✅ User registration metrics working${NC}"
    else
        echo -e "${RED}❌ User registration metrics not working${NC}"
    fi
else
    echo -e "${RED}❌ Failed to get updated metrics${NC}"
fi

# Test 4: Check server uptime
echo -e "\n${BLUE}4. Testing Server Uptime${NC}"
uptime=$(grep -A1 "mcp_server_uptime" /tmp/updated_metrics.txt | tail -1 | awk '{print $2}')

if [ "$uptime" -gt 0 ]; then
    echo -e "${GREEN}✅ Server uptime: ${uptime} seconds${NC}"
else
    echo -e "${RED}❌ Server uptime not increasing${NC}"
fi

# Test 5: Check database size
echo -e "\n${BLUE}5. Testing Database Size${NC}"
db_size=$(grep -A1 "user_database_size" /tmp/updated_metrics.txt | tail -1 | awk '{print $2}')

if [ "$db_size" -ge 5 ]; then
    echo -e "${GREEN}✅ Database size: ${db_size} users${NC}"
else
    echo -e "${RED}❌ Database size unexpected: ${db_size}${NC}"
fi

echo -e "\n${YELLOW}📋 Prometheus Integration Summary${NC}"
echo -e "${GREEN}✅ Features Implemented:${NC}"
echo "  - Prometheus metrics endpoint at /metrics"
echo "  - Real-time metrics collection"
echo "  - User registration tracking"
echo "  - Login attempt/success tracking"
echo "  - API request counting"
echo "  - Server uptime monitoring"
echo "  - Database size tracking"

echo -e "\n${BLUE}🔧 Configuration Files Created:${NC}"
echo "  - prometheus.yml: Prometheus configuration"
echo "  - simple-metrics.ts: Metrics collection"
echo "  - /metrics endpoint: Prometheus format"

echo -e "\n${YELLOW}🚀 Next Steps:${NC}"
echo "  1. Install Prometheus: brew install prometheus"
echo "  2. Run Prometheus: prometheus --config.file=prometheus.yml"
echo "  3. Access Prometheus UI: http://localhost:9090"
echo "  4. View metrics: http://localhost:3001/metrics"

# Clean up
rm -f /tmp/metrics_response.txt /tmp/updated_metrics.txt

echo -e "\n${GREEN}🎉 Prometheus metrics testing complete!${NC}"
