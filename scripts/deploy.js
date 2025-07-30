import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

// Main function
async function deploy() {
  console.log('=== WEBSITE DEPLOYMENT SCRIPT ===');
  
  // Check if git is initialized
  const gitInitialized = fs.existsSync(path.join(rootDir, '.git'));
  
  if (!gitInitialized) {
    console.log('Initializing git repository...');
    execCommand('git init');
  }
  
  // Ask for GitHub repository URL
  const getRepoUrl = () => {
    return new Promise((resolve) => {
      rl.question('Enter your GitHub repository URL (https://github.com/username/repo.git): ', (answer) => {
        resolve(answer.trim());
      });
    });
  };
  
  // Get remote origin or ask for it
  let remoteUrl = '';
  try {
    remoteUrl = execSync('git remote get-url origin', { cwd: rootDir }).toString().trim();
    console.log(`Current remote origin: ${remoteUrl}`);
  } catch (error) {
    console.log('No remote origin found.');
    remoteUrl = await getRepoUrl();
    if (remoteUrl) {
      execCommand(`git remote add origin ${remoteUrl}`);
    } else {
      console.log('No repository URL provided. Skipping remote setup.');
    }
  }
  
  // Build the project first
  console.log('\nBuilding the project with obfuscation...');
  const buildSuccess = execCommand('npm run build:obfuscated');
  
  if (!buildSuccess) {
    console.log('\n=== BUILD FAILED ===');
    console.log('Please check the error messages above and try again.');
    rl.close();
    return;
  }
  
  // Add all files
  console.log('\nAdding files to git...');
  execCommand('git add .');
  
  // Commit changes
  const commitMessage = await new Promise((resolve) => {
    rl.question('Enter commit message (default: "Update website"): ', (answer) => {
      resolve(answer.trim() || 'Update website');
    });
  });
  
  console.log(`Committing with message: "${commitMessage}"...`);
  execCommand(`git commit -m "${commitMessage}"`);
  
  // Push to GitHub with force flag
  console.log('Pushing to GitHub...');
  const branch = 'main';
  const success = execCommand(`git push -f origin ${branch}`);
  
  if (success) {
    console.log('\n=== DEPLOYMENT SUCCESSFUL ===');
    console.log('Your code has been pushed to GitHub.');
    console.log('Vercel should automatically detect the changes and deploy your site.');
    console.log('Check your Vercel dashboard for deployment status.');
  } else {
    console.log('\n=== DEPLOYMENT FAILED ===');
    console.log('Please check the error messages above and try again.');
  }
  
  rl.close();
}

// Run the deployment script
deploy().catch(error => {
  console.error('Deployment script failed:', error);
  process.exit(1);
});