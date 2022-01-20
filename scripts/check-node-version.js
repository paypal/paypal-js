const { readFileSync } = require("fs");
const { join } = require("path");
const chalk = require("chalk");
const semver = require("semver");

const expectedNodeVersion = readFileSync(
    join(__dirname, "../", ".nvmrc"),
    "utf-8"
);
const isValidNodeVersion = semver.satisfies(
    process.version,
    expectedNodeVersion
);

// successfully exit when Node version is valid
if (isValidNodeVersion) {
    return;
}

const output = `
node: ${chalk.bold(process.version)}
Wanted node version ${chalk.bold(expectedNodeVersion)}
`;

console.error(chalk.red(output));
process.exit(1);
