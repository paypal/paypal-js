module.exports = {
    "**/*.ts?(x)": (filenames) => [
        "npm run typecheck",
        `prettier --write ${filenames.join(" ")}`,
        `eslint ${filenames.join(" ")}`,
    ],
    "**/*.js": (filenames) => [
        `prettier --write ${filenames.join(" ")}`,
        `eslint ${filenames.join(" ")}`,
    ],
    "**/*.{json,css,html,md,yml}": (filenames) =>
        `prettier --write ${filenames.join(" ")}`,
};
