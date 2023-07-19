const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const { exec } = require("child_process");

const { version: newVersion } = require("../package.json");

const readmeFile = join(__dirname, "../", "README.md");
const readmeText = readFileSync(readmeFile, "utf-8");
const newReadmeText = readmeText.replace(
    /[0-9]+\.[0-9]+\.[0-9]+\/dist\//g,
    `${newVersion}/dist/`,
);

writeFileSync(readmeFile, newReadmeText, "utf-8");
exec(`git add ${readmeFile}`, (error) => {
    if (error) {
        console.error(`exec error: ${error}`);
    }
});
