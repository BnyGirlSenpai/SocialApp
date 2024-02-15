const { spawn } = require('child_process');

// Define an array of projects with their paths and start commands
const projects = [
  { path: '/JsScraper', startCommand: 'npm start' },
  { path: '/Server', startCommand: 'npm start' },
  // Add more projects as needed
];

// Function to start a project
function startProject(project) {
  const { path, startCommand } = project;

  // Options for the spawn function
  const options = {
    cwd: __dirname + path, // Set the current working directory for the command
    shell: true, // Use a shell to execute the command (for compatibility with npm scripts)
  };

  // Spawn the command to start the project
  const childProcess = spawn('npm', ['start'], options);

  // Listen for the output of the command
  childProcess.stdout.on('data', (data) => {
    console.log(`[${path}] stdout: ${data}`);
  });

  // Listen for any errors that may occur
  childProcess.stderr.on('data', (data) => {
    console.error(`[${path}] stderr: ${data}`);
  });

  // Listen for when the child process exits
  childProcess.on('close', (code) => {
    console.log(`[${path}] Child process exited with code ${code}`);
  });
}

// Start each project
projects.forEach(startProject);
