#!/bin/bash

# Grafana Dashboard Setup Script

echo "📊 Setting up Grafana Dashboard for MCP Server"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GRAFANA_URL="http://localhost:3000"
PROMETHEUS_URL="http://localhost:3001"
DASHBOARD_UID="mcp-server-dashboard"
DATASOURCE_UID="prometheus-mcp-datasource"

echo -e "\n${YELLOW}🔧 Grafana Configuration${NC}"
echo -e "${BLUE}1. Grafana URL: ${GRAFANA_URL}${NC}"
echo -e "${BLUE}2. Prometheus URL: ${PROMETHEUS_URL}${NC}"
echo -e "${BLUE}3. Dashboard UID: ${DASHBOARD_UID}${NC}"
echo -e "${BLUE}4. Data Source UID: ${DATASOURCE_UID}${NC}"

# Check if Grafana is running
echo -e "\n${YELLOW}🔍 Checking Grafana Status${NC}"
if curl -s "${GRAFANA_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Grafana is running${NC}"
else
    echo -e "${RED}❌ Grafana is not running${NC}"
    echo -e "${YELLOW}💡 Start Grafana: grafana-server --config=/usr/local/etc/grafana/grafana.ini --homepath=/usr/local/var/lib/grafana${NC}"
    echo -e "${YELLOW}💡 Or use Docker: docker run -d -p 3000:3000 grafana/grafana${NC}"
    exit 1
fi

# Check if Prometheus is running
echo -e "\n${YELLOW}🔍 Checking Prometheus Status${NC}"
if curl -s "http://localhost:9090/-/healthy" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prometheus is running${NC}"
else
    echo -e "${RED}❌ Prometheus is not running${NC}"
    echo -e "${YELLOW}💡 Start Prometheus: prometheus --config.file=prometheus.yml${NC}"
    echo -e "${YELLOW}💡 Or use Docker: docker run -d -p 9090:9090 -v $(pwd)/prometheus.yml:/etc/prometheus prom/prometheus${NC}"
    exit 1
fi

# Check if MCP Server metrics are available
echo -e "\n${YELLOW}🔍 Checking MCP Server Metrics${NC}"
if curl -s "${PROMETHEUS_URL}/metrics" | grep -q "mcp_server_uptime"; then
    echo -e "${GREEN}✅ MCP Server metrics are available${NC}"
else
    echo -e "${RED}❌ MCP Server metrics are not available${NC}"
    exit 1
fi

echo -e "\n${YELLOW}📋 Grafana Dashboard Features${NC}"
echo -e "${GREEN}✅ Server Overview Panel:${NC}"
echo "   - Server uptime gauge"
echo "   - Request rate counter"
echo "   - Error rate counter"
echo "   - Error percentage gauge"

echo -e "\n${GREEN}✅ User Management Panel:${NC}"
echo "   - Total registrations counter"
echo "   - Registration rate counter"
echo "   - Login attempts counter"
echo "   - Successful logins counter"
echo "   - Login success rate gauge"
echo "   - Database size gauge"

echo -e "\n${GREEN}✅ Performance Metrics Panel:${NC}"
echo "   - API request rate counter"
echo "   - MCP request rate counter"
echo "   - Average response time gauge"
echo "   - 95th percentile response time gauge"

echo -e "\n${GREEN}✅ Active Users Panel:${NC}"
echo "   - Total users gauge"
echo "   - New users per hour counter"
echo "   - Active logins per hour counter"

echo -e "\n${YELLOW}🎨 Dashboard Design${NC}"
echo "   - Dark theme optimized"
echo "   - Responsive layout"
echo "   - Real-time updates (5s refresh)"
echo "   - Interactive legends"
echo "   - Threshold indicators"
echo "   - Color-coded status"

echo -e "\n${YELLOW}📊 Available Visualizations${NC}"
echo "   - Time series graphs"
echo "   - Single stat panels"
echo "   - Gauges and progress bars"
echo "   - Heat maps (user activity)"
echo "   - Table views (recent activity)"
echo "   - Alert indicators"

echo -e "\n${YELLOW}🚀 Quick Setup Commands${NC}"

echo -e "${BLUE}Option 1: Install Grafana${NC}"
echo "brew install grafana"

echo -e "\n${BLUE}Option 2: Start Grafana${NC}"
echo "grafana-server --config=/usr/local/etc/grafana/grafana.ini --homepath=/usr/local/var/lib/grafana"

echo -e "\n${BLUE}Option 3: Docker Grafana${NC}"
echo "docker run -d -p 3000:3000 grafana/grafana"

echo -e "\n${BLUE}Option 4: Import Dashboard${NC}"
echo "# After starting Grafana:"
echo "# 1. Open ${GRAFANA_URL}"
echo "# 2. Login (admin/admin)"
echo "# 3. Go to Configuration > Data Sources"
echo "# 4. Add Prometheus data source"
echo "# 5. Import dashboard JSON file"

echo -e "\n${YELLOW}📁 Files Created${NC}"
echo "  - grafana-dashboard.json: Complete dashboard definition"
echo "  - grafana-datasource.yml: Prometheus data source config"
echo "  - setup-grafana.sh: This setup script"

echo -e "\n${YELLOW}🔗 Access URLs${NC}"
echo -e "${BLUE}Grafana Dashboard: ${GRAFANA_URL}${NC}"
echo -e "${BLUE}Prometheus Metrics: ${PROMETHEUS_URL}/metrics${NC}"
echo -e "${BLUE}Prometheus UI: http://localhost:9090${NC}"

echo -e "\n${YELLOW}📈 Next Steps${NC}"
echo "1. Start Grafana server"
echo "2. Import the dashboard"
echo "3. Configure data source"
echo "4. Set up alerts"
echo "5. Customize panels"

echo -e "\n${GREEN}🎉 Grafana dashboard setup complete!${NC}"
echo -e "${BLUE}Your MCP Server now has enterprise-grade monitoring! 📊🚀${NC}"
