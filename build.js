#!/usr/bin/env node

// Build script wrapper para Vercel
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  console.log('Starting Vue CLI build...');
  
  // Encontra o arquivo JS do vue-cli-service
  const binPath = path.join(__dirname, 'node_modules', '@vue', 'cli-service', 'bin', 'vue-cli-service.js');
  
  if (!fs.existsSync(binPath)) {
    throw new Error(`Vue CLI service not found at ${binPath}`);
  }
  
  console.log(`Using: ${binPath}`);
  
  execSync(`node "${binPath}" build`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

