#!/bin/bash

# SSL Certificate Generation Script

echo "🔐 Generating SSL certificates for localhost..."

# Create SSL directory
mkdir -p nginx/ssl
cd nginx/ssl

# Generate private key
echo "🔑 Generating private key..."
openssl genrsa -out key.pem 2048

# Generate certificate signing request
echo "📝 Generating CSR..."
openssl req -new -key key.pem -out cert.csr -subj "/C=US/ST=State/L=City/O=Organization/OU=IT Department/CN=localhost"

# Generate self-signed certificate
echo "📜 Generating self-signed certificate..."
openssl x509 -req -days 365 -in cert.csr -signkey key.pem -out cert.pem

# Generate DH parameters for perfect forward secrecy
echo "🔒 Generating DH parameters..."
openssl dhparam -out dhparam.pem 2048

# Clean up CSR
rm cert.csr

# Set proper permissions
chmod 600 key.pem
chmod 644 cert.pem
chmod 644 dhparam.pem

echo "✅ SSL certificates generated successfully!"
echo ""
echo "📁 Files created:"
echo "  - nginx/ssl/key.pem (private key)"
echo "  - nginx/ssl/cert.pem (certificate)"
echo "  - nginx/ssl/dhparam.pem (DH parameters)"
echo ""
echo "🔍 Certificate info:"
openssl x509 -in cert.pem -text -noout | grep -E "(Subject:|Issuer:|Not Before:|Not After:)" | head -4

cd ../..
