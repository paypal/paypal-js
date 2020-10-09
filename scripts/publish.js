const { exec } = require("shelljs");

// validate git and npm
require("./validate");

// lint, unit test, and build
exec("npm run lint && npm test && npm run build");

// bump version
const newVersionArg = process.argv[2] || "patch";
exec(`npm version ${newVersionArg}`);

// push up new version commit and tag
exec("git push --follow-tags");

// publish to public npm
exec("npm publish");

// deploy storybook to github pages
exec("npm run deploy-storybook");
