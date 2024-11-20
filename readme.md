# **DEVELOPMENT SCRIPTS**

Utilities scripts to help development in nodejs projects

## DEPENDENCIES

- Nodejs
- @inquirer/prompts

## FILE STRUCTURE

```
│   .gitignore
│   package-lock.json
│   package.json
│   readme.md
│
├───scripts --> files to run for scripts
│       comment-console-logs.cjs
│       create-ui-component.cjs
│       in-app-versioning.cjs
│       write-env.cjs
│
├───templates --> templates files
│       reactjs.cjs
│       scss-module.cjs
│
└───utilities --> Handlers
        scss-file.cjs
```

## HOW TO USE

1. Make sure to have installed the necessary dependencies
2. Copy the script/{file}.cjs needed and its related files like ( templates, utilities ) in your project “script” folder ( at root level || same level of “src”)
3. Edit script files for your needs
4. Add in your package.json under “scripts” properties [“name-of-command”]: “node ./scripts/{{script-file}}.cjs”
5. Run the npm command when you need

## SCRIPTS

### Comment console.logs

This script read all your files project and comment all the console.log lines

### Create UI components ( REACTJS, NEXTJS )

#### IF YOU USE MODULAR STYLES, THE PROJECT REQUIRES SASS AS DEPENDENCY

This script helps you to create ui components for your reactjs/nextjs project without creating one-by-one the files and initialize them following the templates:

- Creates a folder with the name provided in the path provided
- Inside creates the .jsx and .module.scss files with the name provided following the templates

### In App Versioning

This script helps you versioning the app both in GitHub and Visual Frontend

### Write ENV

In case you different env variables like ( DEV, STG, PROD) this will help you to overwrite the .env file with the desire env file
