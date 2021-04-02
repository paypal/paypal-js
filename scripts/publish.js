const { exec } = require("shelljs");
const readline = require("readline");

// validate git and npm
require("./validate");

// lint, unit test, and build
exec("npm run validate");

// run puppeteer tests
exec("npm run test:e2e");

// use standard-version to bump version based on git commit conventions
exec("npx standard-version --no-verify");

// push up new version commit and tag
exec("git push");
exec("git push --follow-tags");

// build again to get the new version number for the comment banner
exec("npm run build");

// use the readline module to simulate npm prompt
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// prompt for otp and publish to public npm
rl.question("Enter OTP for public npm: ", (otp) => {
    exec(`npm publish --otp=${otp}`);

    rl.close();
});
