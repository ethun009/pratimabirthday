import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const outputDir = path.join(rootDir, '.output');
const publicDir = path.join(outputDir, 'public');

// Function to execute shell commands
function execCommand(command) {
  try {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: rootDir });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Function to obfuscate JavaScript files
function obfuscateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that are already minified or don't need obfuscation
    if (filePath.includes('.min.js') || filePath.includes('polyfill')) {
      return;
    }
    
    const obfuscationResult = JavaScriptObfuscator.obfuscate(content, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.7,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      debugProtection: false,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: false,
      rotateStringArray: true,
      selfDefending: true,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.8,
      transformObjectKeys: true,
      unicodeEscapeSequence: false
    });
    
    fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());
    console.log(`Obfuscated: ${filePath}`);
  } catch (error) {
    console.error(`Error obfuscating file: ${filePath}`);
    console.error(error.message);
  }
}

// Function to recursively process files in a directory
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.js') && !filePath.includes('server')) {
      obfuscateFile(filePath);
    }
  }
}

// Main build function
async function buildObfuscated() {
  console.log('=== BUILDING OBFUSCATED WEBSITE ===');
  
  // Step 1: Generate the static site
  console.log('\nStep 1: Generating static site...');
  const buildSuccess = execCommand('npm run generate');
  
  if (!buildSuccess) {
    console.error('Build failed. Aborting obfuscation process.');
    process.exit(1);
  }
  
  // Step 2: Obfuscate JavaScript files
  console.log('\nStep 2: Obfuscating JavaScript files...');
  if (fs.existsSync(path.join(publicDir, '_nuxt'))) {
    processDirectory(path.join(publicDir, '_nuxt'));
  }
  
  console.log('\n=== BUILD COMPLETED SUCCESSFULLY ===');
  console.log('Your obfuscated website is ready in the .output/public directory.');
}

// Run the build script
buildObfuscated().catch(error => {
  console.error('Build script failed:', error);
  process.exit(1);
});