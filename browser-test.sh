#!/bin/bash

# Browser Testing Guide

echo "🌐 Browser Testing Guide for Angular + MCP Server"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}🚀 Services Status${NC}"

# Check Angular app
if curl -s http://localhost:4200 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Angular App: http://localhost:4200${NC}"
else
    echo -e "${RED}❌ Angular App: Not running${NC}"
fi

# Check MCP server
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MCP Server: http://localhost:3001${NC}"
else
    echo -e "${RED}❌ MCP Server: Not running${NC}"
fi

echo -e "\n${YELLOW}🧪 Testing Authentication${NC}"

# Test admin login
echo "Testing admin login..."
admin_response=$(curl -s -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

if echo "$admin_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Admin login successful${NC}"
    admin_token=$(echo "$admin_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    # Test authenticated request
    users_response=$(curl -s -H "Authorization: Bearer $admin_token" \
        http://localhost:3001/users)
    
    if echo "$users_response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Admin API access working${NC}"
        user_count=$(echo "$users_response" | grep -o '\[.*\]' | grep -o '{' | wc -c)
        echo -e "${BLUE}📊 Users in database: $((user_count - 1))${NC}"
    else
        echo -e "${RED}❌ Admin API access failed${NC}"
    fi
else
    echo -e "${RED}❌ Admin login failed${NC}"
fi

# Test user login
echo "Testing user login..."
user_response=$(curl -s -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"johndoe","password":"user123"}')

if echo "$user_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ User login successful${NC}"
    user_token=$(echo "$user_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    # Test authenticated request
    users_response=$(curl -s -H "Authorization: Bearer $user_token" \
        http://localhost:3001/users)
    
    if echo "$users_response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ User API access working${NC}"
    else
        echo -e "${RED}❌ User API access failed${NC}"
    fi
else
    echo -e "${RED}❌ User login failed${NC}"
fi

echo -e "\n${YELLOW}🌐 Browser Testing Instructions${NC}"

echo -e "${BLUE}1. Open your browser and navigate to:${NC}"
echo -e "   ${GREEN}http://localhost:4200${NC}"

echo -e "\n${BLUE}2. Test the following features:${NC}"
echo -e "   📝 Login with demo accounts:"
echo -e "      ${YELLOW}Admin:${NC} admin / admin123"
echo -e "      ${YELLOW}User:${NC}  johndoe / user123"

echo -e "\n${BLUE}3. Verify functionality:${NC}"
echo -e "   ✅ Login redirects to correct dashboard"
echo -e "   ✅ Admin users see user management interface"
echo -e "   ✅ Regular users see read-only user list"
echo -e "   ✅ User selection shows details"
echo -e "   ✅ Logout clears authentication"

echo -e "\n${BLUE}4. Test RBAC (Role-Based Access Control):${NC}"
echo -e "   🔐 Try to access /admin as regular user (should be blocked)"
echo -e "   👤 Try admin operations as regular user (should be blocked)"
echo -e "   🛡️ Verify unauthorized requests are rejected"

echo -e "\n${BLUE}5. Check browser developer tools:${NC}"
echo -e "   📊 Network tab: Verify API calls to localhost:3001"
echo -e "   🔍 Console: Check for any JavaScript errors"
echo -e "   🍪 Storage: Verify JWT token in localStorage"
echo -e "   📱 Responsive: Test on different screen sizes"

echo -e "\n${BLUE}6. Test edge cases:${NC}"
echo -e "   🚫 Try invalid credentials (should show error)"
echo -e "   ⏱️ Test session timeout (token expiration)"
echo -e "   🔄 Test page refresh after login"
echo -e "   📱 Test on mobile devices"

echo -e "\n${YELLOW}📋 Expected Results${NC}"
echo -e "   ${GREEN}✅${NC} Successful login redirects to appropriate dashboard"
echo -e "   ${GREEN}✅${NC} Admin users can create/edit/delete users"
echo -e "   ${GREEN}✅${NC} Regular users can only view users"
echo -e "   ${GREEN}✅${NC} All API calls include proper authentication"
echo -e "   ${GREEN}✅${NC} Unauthorized access is properly blocked"

echo -e "\n${YELLOW}🔧 Troubleshooting${NC}"
echo -e "   If login fails: Check MCP server logs"
echo -e "   If page doesn't load: Check Angular compilation"
echo -e "   If API calls fail: Check CORS and authentication"
echo -e "   If RBAC fails: Verify user roles and guards"

echo -e "\n${GREEN}🎉 Ready for comprehensive browser testing!${NC}"
echo -e "${BLUE}The application demonstrates:${NC}"
echo -e "   🏗️  Smart Container/Dummy Frontend Architecture"
echo -e "   🔐  JWT Authentication with RBAC"
echo -e "   🗄️  MCP Server with SQLite Database"
echo -e "   🛡️  Role-Based Access Control"
echo -e "   🔄  Real-time Data Management"
