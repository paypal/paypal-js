const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const { execFile } = require("child_process");

const { version: newVersion } = require("../package.json");

const readmeFile = join(__dirname, "../", "README.md");
const readmeText = readFileSync(readmeFile, "utf-8");
const newReadmeText = readmeText.replace(
    /[0-9]+\.[0-9]+\.[0-9]+\/dist\//g,
    `${newVersion}/dist/`,
);

writeFileSync(readmeFile, newReadmeText, "utf-8");
execFile("git", ["add", readmeFile], (error) => {
    if (error) {
        console.error(`exec error: ${error}`);
    }
});
