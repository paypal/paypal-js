const { readFileSync } = require("fs");
const { join } = require("path");
const chalk = require("chalk");
const check = require("check-node-version");

const nodeVersion = readFileSync(join(__dirname, "../", ".nvmrc"), "utf-8");

check({ node: nodeVersion }, (err, result) => {
    if (err) {
        throw err;
    }

    printVersions(result);
    process.exit(result.isSatisfied ? 0 : 1);
});

// printVersions and printInstalledVersion were copied from:
// https://github.com/parshap/check-node-version/blob/master/cli.js

function printVersions(result) {
    Object.keys(result.versions).forEach((name) => {
        const info = result.versions[name];
        const isSatisfied = info.isSatisfied;

        // print installed version
        if (!isSatisfied) {
            printInstalledVersion(name, info);
        }

        if (isSatisfied) return;

        // report any non-compliant versions
        const { raw, range } = info.wanted;

        console.error(
            chalk.red(
                `Wanted ${name} version ` + chalk.bold(`${raw} (${range})`)
            ),
            "\n"
        );
    });
}

function printInstalledVersion(
    name,
    { version, isSatisfied, invalid, notfound }
) {
    let versionNote = "";

    if (version) {
        versionNote = name + ": " + chalk.bold(version);
    }

    if (invalid) {
        versionNote =
            name + ": " + chalk.bold("given version not semver-compliant");
    }

    if (notfound) {
        versionNote = name + ": not found";
    }

    if (isSatisfied) {
        if (version) console.log(versionNote);
        else console.log(chalk.gray(versionNote));
    } else {
        console.log(chalk.red(versionNote));
    }
}
