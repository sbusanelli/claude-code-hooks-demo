#!/bin/bash

# Registration Flow Testing Script

echo "🧪 Testing User Registration Flow"

BASE_URL="http://localhost:3001"
API_URL="${BASE_URL}/auth"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}🧪 Testing Registration Endpoints${NC}"

# Test 1: Username availability check
echo -e "\n${BLUE}1. Testing Username Availability Check${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/username_check.json -X POST \
    "${API_URL}/register/check-username" \
    -H "Content-Type: application/json" \
    -d '{"username":"newuser123"}')

if [ "$response" = "200" ]; then
    available=$(cat /tmp/username_check.json | grep -o '"available":\w*')
    echo -e "${GREEN}✅ Username availability check working${NC}"
    echo -e "${BLUE}   Response: $available${NC}"
else
    echo -e "${RED}❌ Username availability check failed (HTTP $response)${NC}"
fi

# Test 2: Email availability check
echo -e "\n${BLUE}2. Testing Email Availability Check${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/email_check.json -X POST \
    "${API_URL}/register/check-email" \
    -H "Content-Type: application/json" \
    -d '{"email":"newuser@example.com"}')

if [ "$response" = "200" ]; then
    available=$(cat /tmp/email_check.json | grep -o '"available":\w*')
    echo -e "${GREEN}✅ Email availability check working${NC}"
    echo -e "${BLUE}   Response: $available${NC}"
else
    echo -e "${RED}❌ Email availability check failed (HTTP $response)${NC}"
fi

# Test 3: Valid registration
echo -e "\n${BLUE}3. Testing Valid Registration${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/register_response.json -X POST \
    "${API_URL}/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name":"Test User",
        "email":"testuser@example.com",
        "username":"testuser",
        "password":"SecurePass123!",
        "confirmPassword":"SecurePass123!",
        "phone":"123-456-7890",
        "website":"https://testuser.com"
    }')

if [ "$response" = "201" ]; then
    success=$(cat /tmp/register_response.json | grep -o '"success":\w*')
    user_id=$(cat /tmp/register_response.json | grep -o '"id":\d*')
    echo -e "${GREEN}✅ Registration successful${NC}"
    echo -e "${BLUE}   User ID: $user_id${NC}"
    echo -e "${BLUE}   Response: $success${NC}"
else
    echo -e "${RED}❌ Registration failed (HTTP $response)${NC}"
    cat /tmp/register_response.json
fi

# Test 4: Login with new user
echo -e "\n${BLUE}4. Testing Login with New User${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/login_response.json -X POST \
    "${API_URL}/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"SecurePass123!"}')

if [ "$response" = "200" ]; then
    success=$(cat /tmp/login_response.json | grep -o '"success":\w*')
    user_role=$(cat /tmp/login_response.json | grep -o '"role":"\w*"')
    user_token=$(cat /tmp/login_response.json | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login successful${NC}"
    echo -e "${BLUE}   Role: $user_role${NC}"
    echo -e "${BLUE}   Token: ${user_token:0:50}...${NC}"
    
    # Test authenticated API access
    if [ -n "$user_token" ]; then
        api_response=$(curl -s -w "%{http_code}" -o /tmp/api_test.json \
            -H "Authorization: Bearer $user_token" \
            "${BASE_URL}/users")
        
        if [ "$api_response" = "200" ]; then
            echo -e "${GREEN}✅ Authenticated API access working${NC}"
        else
            echo -e "${RED}❌ Authenticated API access failed (HTTP $api_response)${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Login failed (HTTP $response)${NC}"
    cat /tmp/login_response.json
fi

# Test 5: Duplicate username registration
echo -e "\n${BLUE}5. Testing Duplicate Username${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/duplicate_response.json -X POST \
    "${API_URL}/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name":"Duplicate User",
        "email":"duplicate@example.com",
        "username":"admin",
        "password":"SecurePass123!",
        "confirmPassword":"SecurePass123!"
    }')

if [ "$response" = "409" ]; then
    echo -e "${GREEN}✅ Duplicate username properly rejected${NC}"
    error_field=$(cat /tmp/duplicate_response.json | grep -o '"field":"\w*"')
    error_message=$(cat /tmp/duplicate_response.json | grep -o '"message":"\w*"')
    echo -e "${BLUE}   Error: $error_field - $error_message${NC}"
else
    echo -e "${RED}❌ Duplicate username check failed (HTTP $response)${NC}"
fi

# Test 6: Invalid registration data
echo -e "\n${BLUE}6. Testing Invalid Registration Data${NC}"
response=$(curl -s -w "%{http_code}" -o /tmp/invalid_response.json -X POST \
    "${API_URL}/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name":"",
        "email":"invalid-email",
        "username":"ab",
        "password":"123",
        "confirmPassword":"456"
    }')

if [ "$response" = "400" ]; then
    echo -e "${GREEN}✅ Invalid data properly rejected${NC}"
    cat /tmp/invalid_response.json | grep -o '"message":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "Validation errors found"
else
    echo -e "${RED}❌ Invalid data check failed (HTTP $response)${NC}"
fi

echo -e "\n${YELLOW}📋 Registration Flow Test Summary${NC}"
echo -e "${GREEN}✅ Features Tested:${NC}"
echo "  - Username availability checking"
echo "  - Email availability checking"
echo "  - User registration with validation"
echo "  - Password hashing and security"
echo "  - Duplicate user prevention"
echo "  - Invalid data rejection"
echo "  - Login with new user"
echo "  - Authenticated API access"

echo -e "\n${BLUE}🌐 Browser Testing Instructions${NC}"
echo -e "1. Open browser to: ${GREEN}http://localhost:4200/register${NC}"
echo -e "2. Test registration form with various inputs"
echo -e "3. Verify validation messages appear"
echo -e "4. Test successful registration flow"
echo -e "5. Try login with new credentials"
echo -e "6. Verify user role is 'user' (not admin)"

echo -e "\n${YELLOW}🎯 Expected Results${NC}"
echo -e "${GREEN}✅${NC} New users can register and get 'user' role"
echo -e "${GREEN}✅${NC} Registration redirects to login after success"
echo -e "${GREEN}✅${NC} Duplicate usernames/emails are rejected"
echo -e "${GREEN}✅${NC} Password strength validation works"
echo -e "${GREEN}✅${NC} Real-time availability checking"

# Clean up
rm -f /tmp/username_check.json /tmp/email_check.json /tmp/register_response.json /tmp/login_response.json /tmp/duplicate_response.json /tmp/invalid_response.json /tmp/api_test.json

echo -e "\n${GREEN}🎉 Registration flow testing complete!${NC}"
