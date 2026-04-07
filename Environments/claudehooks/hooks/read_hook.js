import path from "path";

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

function isSecretFile(filePath) {
  const normalizedPath = path.resolve(filePath);
  
  return SECRET_FILE_PATTERNS.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(normalizedPath) || pattern.test(path.basename(normalizedPath));
    }
    return normalizedPath.includes(pattern);
  });
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

  // readPath is the path to the file that Claude is trying to read
  const readPath =
    toolArgs.tool_input?.file_path || toolArgs.tool_input?.path || "";

  if (readPath && isSecretFile(readPath)) {
    console.error(`🚫 Access denied: Cannot read secret file: ${readPath}`);
    console.error("This file contains sensitive information and is protected by security hooks.");
    process.exit(2);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(`Hook error: ${err.message}`);
  process.exit(1);
});
