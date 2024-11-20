const fs = require('fs');
const path = require('path');

/**
 * Merges environment variable files starting with `.ENV_` into a single `.env` file.
 * 
 * This function reads all files in the specified directory that start with `.ENV_`, processes 
 * each file to append its content to a single `.env` file. It adds the filename as a comment for 
 * each line and removes unnecessary newlines. The merged content is written to a new `.env` file, 
 * overwriting the existing one if necessary.
 * 
 * @function mergeEnvFiles
 * @returns {void}
 */
function mergeEnvFiles() {
  const directoryPath = path.resolve(__dirname, "../"); // Adjust this if needed
  const envFilePath = path.join(directoryPath, '.env');
  
  // Clear the .env file if it already exists
  if (fs.existsSync(envFilePath)) {
    fs.writeFileSync(envFilePath, ''); // Clears the file content
  }

  const envFiles = fs.readdirSync(directoryPath).filter(file => file.startsWith('.ENV_'));
  
  let envContent = '';

  envFiles.forEach(file => {
    const filePath = path.join(directoryPath, file);
    const fileName = path.basename(file).replace('.ENV_', '');
    let fileContent = fs.readFileSync(filePath, 'utf8');

    // Process each line to add the filename to comments and remove unnecessary newlines
    fileContent = fileContent.split('\n').map(line => {
      if (line.trim().startsWith('#')) {
        return `${line.trim()} ${fileName}`;
      }
      return line.trim(); // Remove any leading or trailing whitespace
    }).join('\n');

    envContent += `${fileContent}\n`;
  });

  // Write the processed content to the .env file
  fs.writeFileSync(envFilePath, envContent.trim() + '\n'); // Trim and ensure a final newline

  console.log(`.env file has been generated with content from ${envFiles.length} files.`);
}

mergeEnvFiles();
