#!/bin/bash

# Lightweight Grafana Setup for MCP Server

echo "📊 Setting up Grafana for MCP Server (Lightweight Mode)"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check disk space
echo -e "\n${YELLOW}💾 Checking Disk Space${NC}"
AVAILABLE_SPACE=$(df -h / | awk 'NR==2 {print $4}')
echo -e "${BLUE}Available space: ${AVAILABLE_SPACE}${NC}"

if [[ "$AVAILABLE_SPACE" == *"M"* ]]; then
    echo -e "${RED}❌ Low disk space detected${NC}"
    echo -e "${YELLOW}💡 Using lightweight setup approach${NC}"
fi

echo -e "\n${YELLOW}🔧 Grafana Setup Options${NC}"

# Option 1: Try Homebrew with cleanup
echo -e "${BLUE}Option 1: Homebrew Installation${NC}"
echo "brew cleanup --prune=all"
echo "brew install grafana"

# Option 2: Direct download with cleanup
echo -e "\n${BLUE}Option 2: Direct Download${NC}"
echo "# Clean up space first"
echo "rm -rf ~/Downloads/grafana-*"
echo "curl -L -o ~/grafana.tar.gz https://dl.grafana.com/oss/release/grafana-10.4.2.darwin-amd64.tar.gz"
echo "cd ~ && tar -xzf grafana.tar.gz"
echo "./grafana-10.4.2/bin/grafana server"

# Option 3: Docker (requires cleanup)
echo -e "\n${BLUE}Option 3: Docker Container${NC}"
echo "# Remove unused containers first"
echo "docker system prune -f"
echo "docker run -d -p 3000:3000 --name grafana grafana/grafana:latest"

# Option 4: Online Grafana (no installation)
echo -e "\n${BLUE}Option 4: Online Grafana (Recommended)${NC}"
echo "1. Go to https://grafana.com/grafana/cloud/"
echo "2. Sign up for free account"
echo "3. Add Prometheus data source: http://localhost:3001/metrics"
echo "4. Import dashboard JSON"

echo -e "\n${YELLOW}🚀 Quick Start Commands${NC}"

# Try to create space and install
echo -e "${BLUE}Attempting to free up space...${NC}"
brew cleanup --prune=all 2>/dev/null || echo "Homebrew cleanup completed"

echo -e "\n${BLUE}Attempting Grafana installation...${NC}"
if brew install grafana 2>/dev/null; then
    echo -e "${GREEN}✅ Grafana installed successfully!${NC}"
    echo -e "${YELLOW}🚀 Start Grafana:${NC}"
    echo "brew services start grafana"
    echo -e "${YELLOW}📊 Access Grafana:${NC}"
    echo "open http://localhost:3000"
else
    echo -e "${RED}❌ Installation failed${NC}"
    echo -e "${YELLOW}💡 Alternative approaches:${NC}"
    
    echo -e "\n${GREEN}Option A: Online Grafana Cloud${NC}"
    echo "1. Visit: https://grafana.com/grafana/cloud/"
    echo "2. Create free account"
    echo "3. Add Prometheus data source: http://localhost:3001/metrics"
    echo "4. Import our dashboard JSON"
    
    echo -e "\n${GREEN}Option B: Local Docker${NC}"
    echo "1. docker system prune -f"
    echo "2. docker run -d -p 3000:3000 grafana/grafana:latest"
    echo "3. Access: http://localhost:3000"
    
    echo -e "\n${GREEN}Option C: Direct Download${NC}"
    echo "1. Download: https://dl.grafana.com/oss/release/grafana-10.4.2.darwin-amd64.tar.gz"
    echo "2. Extract and run: ./grafana-10.4.2/bin/grafana server"
fi

echo -e "\n${YELLOW}📋 Grafana Configuration${NC}"
echo "Default login: admin / admin"
echo "Data source URL: http://localhost:3001/metrics"
echo "Dashboard file: grafana-dashboard.json"

echo -e "\n${YELLOW}🔍 Verification Steps${NC}"
echo "1. Check MCP Server: curl http://localhost:3001/metrics"
echo "2. Check Grafana: curl http://localhost:3000/api/health"
echo "3. Import Dashboard: Upload grafana-dashboard.json"

echo -e "\n${GREEN}📊 Grafana setup guide ready!${NC}"
echo -e "${BLUE}Choose the option that works best for your environment${NC}"
