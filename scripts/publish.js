const { exec } = require("shelljs");
const readline = require("readline");

// validate git and npm
require("./validate");

// lint, unit test, and build
exec("npm run lint && npm test && npm run build");

// bump version
const newVersionArg = process.argv[2] || "patch";
exec(`npm version ${newVersionArg}`);

// push up new version commit and tag
exec("git push");
exec("git push --follow-tags");

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
