const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { select, input } = require("@inquirer/prompts")

/**
 * Retrieves the most recent Git tag or the version from `package.json` if no Git tag exists.
 * 
 * This function attempts to get the most recent Git tag using the `git describe --tags --abbrev=0` command.
 * If no tag is found, it reads the version from `package.json` and returns it. If an error occurs during 
 * the Git command or reading `package.json`, it logs the error and returns `null`.
 * 
 * @function getLastGitTag
 * @returns {string|null} - The most recent Git tag, or the version from `package.json` if no tag is found, or `null` if an error occurs.
 */
function getLastGitTag() {
  try {
    const tag = execSync('git describe --tags --abbrev=0').toString().trim();
    if(!tag){
      
      const packageJsonPath = path.resolve(__dirname, 'package.json');
      const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      return packageJsonContent.version
    }
    return tag;
  } catch (error) {
    console.error('Errore nel recuperare la tag Git:', error);
    return null;
  }
}

/**
 * Sets a new version number based on the last Git tag and the type of version change selected by the user.
 * 
 * This function takes the last Git tag, prompts the user to select the type of version change (e.g., new version, major change, or fix),
 * and generates a new version number and name accordingly. It returns the new version's number and name.
 * 
 * @async
 * @function setVersion
 * @param {string} lastGitTag - The last Git tag (version) from which the new version will be derived.
 * @returns {Promise<Object>} An object containing the new version name and number.
 * @returns {string} return.name - The full version name (e.g., `v1.0.0`).
 * @returns {string} return.number - The version number (e.g., `1.0.0`).
 */
async function setVersion(lastGitTag){

  let newVersionName = lastGitTag

  const askNewVersionType = await select({
    message: "What type of version is this?",
    choices: [
      {
        name: "new-version",
        value: "new-version",
        description: "Big changes {{new-version}}.0.0"
      },
      {
        name: "major",
        value: "major",
        description: "Major changes 1.{{major}}.0"
      },
      {
        name: "fix",
        value: "fix",
        description: "Fixes 1.0.{{fix}}"
      },
    ]
  })

  let newVersionNumber = "1.0.0"

  let stringBeforeVersion = lastGitTag.slice(0, -5)
  let versionFromTag = lastGitTag.slice(-5)
  newVersionNumber = lastGitTag.slice(-5)

  let NEW_VERSION = versionFromTag.charAt(0)
  let MAJOR = versionFromTag.charAt(2)
  let FIX = versionFromTag.charAt(4)


  if(askNewVersionType === "new-version"){
    newVersionName = `${stringBeforeVersion}${parseInt(NEW_VERSION) + 1}.0.0`
    newVersionNumber = `${parseInt(NEW_VERSION) + 1}.0.0`
  }
  if(askNewVersionType === "major"){
    newVersionName = `${stringBeforeVersion}${NEW_VERSION}.${parseInt(MAJOR) + 1}.0`
    newVersionNumber = `${NEW_VERSION}.${parseInt(MAJOR) + 1}.0`
  }
  if(askNewVersionType === "fix"){
    newVersionName = `${stringBeforeVersion}${NEW_VERSION}.${MAJOR}.${parseInt(FIX) + 1}`
    newVersionNumber = `${NEW_VERSION}.${MAJOR}.${parseInt(FIX) + 1}`
  }

  const result = {
    "number": newVersionNumber,
    "name": newVersionName
  }

  return result

}

/**
 * Initializes a new version by prompting the user for a custom version name.
 * 
 * This function sets the default version number as `1.0.0` and prompts the user to input a custom version name 
 * if they do not want to use the default format. The final version name is returned in the format `v.[versionName].1.0.0`.
 * 
 * @async
 * @function initVersion
 * @returns {Promise<Object>} An object containing the version name and version number.
 * @returns {string} return.name - The full version name in the format `v.[versionName].1.0.0`.
 * @returns {string} return.number - The default version number `1.0.0`.
 */
async function initVersion(){
  let newVersionNumber
  let newVersionName

  newVersionNumber = "1.0.0"
  const askVersionName = await input({ message: "Type a version name if not the default format 1.0.0"})
  newVersionName = `v.${askVersionName}.1.0.0`

  return {
    name: newVersionName,
    number: newVersionNumber
  }

}

/**
 * Updates the version field in a specified JSON file with the provided version name.
 * 
 * This function reads the content of a JSON file at the specified `filePath`, updates its `version` field 
 * with the provided version name, and writes the updated content back to the JSON file.
 * 
 * @function updateVersionJsonFile
 * @param {string} filePath - The path to the JSON file to update.
 * @param {string} versionName - The version name to set in the JSON file (e.g., "v1.0.0").
 */
function updateVersionJsonFile(filePath, versionName){
  const fileContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8'));

  fileContent.version = versionName;

  fs.writeFileSync(path.resolve(__dirname, filePath), JSON.stringify(fileContent, null, 2));
  console.log(`File ${path.resolve(__dirname, filePath)} aggiornato con la versione: ${versionName}`);
}

/**
 * Updates the version field in the `package.json` file with the provided version number.
 * 
 * This function reads the `package.json` file, updates its `version` field with the provided version number, 
 * and writes the updated content back to the `package.json` file.
 * 
 * @function updatePackageJson
 * @param {string} versionNumber - The version number to set in the `package.json` file (e.g., "1.0.0").
 */
function updatePackageJson(versionNumber){
  // Update the version in package.json with the git tag
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Update the version in package.json
  packageJsonContent.version = versionNumber;

  // Write the updated content back to package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
  console.log(`package.json updated with tag: ${versionNumber}`);
}

/**
 * Pushes the new version to the Git repository by committing changes and creating a new tag.
 * 
 * This function stages all changes (`git add .`), commits them with a message, and pushes the commit to the remote repository.
 * It then creates a new Git tag with the provided version name and pushes the tag to the remote repository.
 * 
 * @function pushNewVersion
 * @param {string} versionName - The version name to assign as a Git tag (e.g., "v1.0.0").
 */
function pushNewVersion(versionName){
  execSync('git add .')
  execSync('git commit -m "version: update version"')
  execSync('git push -u origin"')
  execSync(`git tag ${versionName}`)
  execSync(`git push -u origin --tags`)
  console.log("NEW VERSION PUSHED", versionName)
}

/**
 * Updates the version in JSON files based on user input or Git tag.
 * 
 * This function prompts the user to select the type of version update (either initializing a new version or following the latest Git tag).
 * It then updates the version in the provided JSON file (if `filePath` is provided) and the `package.json` file.
 * Additionally, it pushes the new version to the Git repository by tagging it.
 * 
 * @async
 * @function updateVersionInJson
 * @param {string} filePath - The path to the JSON file to update (if applicable).
 * @throws {Error} Will throw an error if there is an issue updating the files or Git repository.
 */
async function updateVersionInJson(filePath) {

  const askNewVersionType = await select({
    message: "What type of version is this?",
    choices: [
      {
        name: "init",
        value: "init",
        description: "Initial version, you will have to give it a name"
      },
      {
        name: "git-tag",
        value: "git-tag",
        description: "Follows the git tags"
      }
    ]
  })

  if(askNewVersionType === "init"){
    
    const { name, number } = await initVersion()
    if(filePath){
      updateVersionJsonFile(filePath, name)
    }

    updatePackageJson(number)
    pushNewVersion(name)

  } else {
    const tag = getLastGitTag();
  
    if (tag) {
      const { name, number } = await setVersion(tag)
      try {
        if(filePath){
          updateVersionJsonFile(filePath, name)
        }
        updatePackageJson(number)
        pushNewVersion(name)
      } catch (error) {
        console.error('Errore durante l\'aggiornamento del file JSON:', error);
      }
    }
  }
}
  
// Esempio di utilizzo
updateVersionInJson();