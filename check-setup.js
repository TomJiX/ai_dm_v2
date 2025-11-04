#!/usr/bin/env node

/**
 * Development helper script
 * Checks setup and provides helpful information
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎲 AI Dungeon Master - Setup Checker\n');

// Check 1: Node modules
console.log('📦 Checking dependencies...');
const mcpNodeModules = path.join(__dirname, 'mcp-server', 'node_modules');
const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');

if (!fs.existsSync(mcpNodeModules)) {
  console.log('❌ MCP server dependencies not installed');
  console.log('   Run: cd mcp-server && npm install\n');
} else {
  console.log('✅ MCP server dependencies installed');
}

if (!fs.existsSync(frontendNodeModules)) {
  console.log('❌ Frontend dependencies not installed');
  console.log('   Run: cd frontend && npm install\n');
} else {
  console.log('✅ Frontend dependencies installed');
}

// Check 2: Environment file
console.log('\n🔑 Checking GitHub token configuration...');
const envFile = path.join(__dirname, 'frontend', '.env.local');

if (!fs.existsSync(envFile)) {
  console.log('❌ .env.local file not found');
  console.log('   Run: cd frontend && copy .env.example .env.local');
  console.log('   Then edit .env.local with your GitHub token\n');
} else {
  const envContent = fs.readFileSync(envFile, 'utf8');
  if (envContent.includes('your_github_token_here')) {
    console.log('⚠️  .env.local exists but needs GitHub token');
    console.log('   Edit frontend/.env.local and add your GitHub token\n');
  } else {
    console.log('✅ GitHub token configured (remember to keep it secret!)');
  }
}

// Check 3: Scenario file
console.log('\n📖 Checking scenario...');
const scenarioFile = path.join(__dirname, 'frontend', 'src', 'data', 'goblin-cave.json');

if (!fs.existsSync(scenarioFile)) {
  console.log('❌ Scenario file not found');
  console.log('   The goblin-cave.json should be in frontend/src/data/\n');
} else {
  console.log('✅ Goblin Cave scenario found');
}

// Instructions
console.log('\n🚀 Ready to run?');
console.log('\n   1. Make sure you have a GitHub token with Copilot scope');
console.log('      Get one at: https://github.com/settings/tokens');
console.log('\n   2. Configure your GitHub token in frontend/.env.local');
console.log('\n   3. Start the development server:');
console.log('      cd frontend');
console.log('      npm run dev');
console.log('\n   4. Open your browser to: http://localhost:5173');
console.log('\n📚 See QUICKSTART.md for detailed instructions');
console.log('📖 See GITHUB_COPILOT_SETUP.md for token setup help');
console.log('⚔️  Happy adventuring!\n');
