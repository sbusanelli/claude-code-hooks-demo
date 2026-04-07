import path from "path";
import fs from "fs";

// List of secret file patterns to block
const SECRET_FILE_PATTERNS = [
  /\.env$/,
  /\.env\./,
  /\.key$/,
  /\.pem$/,
  /\.p12$/,
  /\.pfx$/,
  /\.crt$/,
  /\.pem$/,
  /secret/i,
  /private/i,
  /credentials/i,
  /config\/.*\.json$/,
  /\.aws\/credentials/,
  /\.azure/,
  /\.gcp/,
  /\/secrets\//,
  /\.pgpass$/,
  /\.my.cnf$/,
  /\/\.ssh\//,
  /\.ssh\/id_.*$/,
  /\/\.vault/,
  /\.tfvars$/,
  /\.tfstate$/,
  /\/node_modules\/.*\/\.env/,
];

// Patterns for detecting secret content in files
const SECRET_CONTENT_PATTERNS = [
  /password\s*[:=]\s*['"][^'"]+['"]/i,
  /secret\s*[:=]\s*['"][^'"]+['"]/i,
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /token\s*[:=]\s*['"][^'"]+['"]/i,
  /private[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /access[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /secret[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
  /aws[_-]?secret[_-]?access[_-]?key/i,
  /aws[_-]?access[_-]?key[_-]?id/i,
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
  /-----BEGIN\s+CERTIFICATE-----/,
  /sk-[a-zA-Z0-9]{48}/, // OpenAI API key pattern
  /ghp_[a-zA-Z0-9]{36}/, // GitHub personal access token
  /xoxb-[0-9]{10}-[0-9]{10}-[a-zA-Z0-9]{24}/, // Slack bot token
];

function isSecretFile(filePath) {
  const normalizedPath = path.resolve(filePath);
  
  return SECRET_FILE_PATTERNS.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(normalizedPath) || pattern.test(path.basename(normalizedPath));
    }
    return normalizedPath.includes(pattern);
  });
}

function containsSecrets(content) {
  if (!content || typeof content !== 'string') {
    return false;
  }
  
  return SECRET_CONTENT_PATTERNS.some(pattern => pattern.test(content));
}

function getFilePath(toolInput) {
  return toolInput.file_path || toolInput.path || toolInput.target_file;
}

function getFileContent(toolInput) {
  return toolInput.content || toolInput.contents || toolInput.new_string || '';
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

  const toolInput = toolArgs.tool_input || {};
  const filePath = getFilePath(toolInput);
  const content = getFileContent(toolInput);

  if (!filePath) {
    process.exit(0);
  }

  // Check 1: Block writing to secret file paths
  if (isSecretFile(filePath)) {
    console.error(`🚫 Access denied: Cannot write to secret file: ${filePath}`);
    console.error("This file path contains sensitive information and is protected by security hooks.");
    process.exit(2);
  }

  // Check 2: Block writing files that contain secret content
  if (content && containsSecrets(content)) {
    console.error(`🚫 Access denied: File contains detected secrets: ${filePath}`);
    console.error("The file content appears to contain sensitive information (API keys, passwords, tokens, etc.).");
    console.error("Please remove or redact any sensitive information before proceeding.");
    process.exit(2);
  }

  // Check 3: Additional safety - check if file already exists and contains secrets
  if (fs.existsSync(filePath)) {
    try {
      const existingContent = fs.readFileSync(filePath, 'utf8');
      if (containsSecrets(existingContent)) {
        console.error(`🚫 Access denied: Target file already contains secrets: ${filePath}`);
        console.error("This file appears to already contain sensitive information.");
        console.error("Modifying files with existing secrets is blocked for security reasons.");
        process.exit(2);
      }
    } catch (error) {
      // If we can't read the file, err on the side of caution
      console.error(`⚠️  Warning: Could not verify existing file contents: ${filePath}`);
      console.error("Proceeding with caution - ensure no secrets are being added.");
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(`Hook error: ${err.message}`);
  process.exit(1);
});
