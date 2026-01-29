const path = require("path");

module.exports = {
    stories: [
        "../src/**/*.stories.mdx",
        "../src/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: [
        "@storybook/addon-links",
        {
            name: "@storybook/addon-essentials",
            options: {
                controls: true,
                actions: true,
            },
        },
    ],
    webpackFinal: async (config) => {
        // Webpack 4 doesn't support the "exports" field in package.json
        // Add alias to resolve @paypal/paypal-js/sdk-v6 correctly
        config.resolve.alias = {
            ...config.resolve.alias,
            "@paypal/paypal-js/sdk-v6": path.resolve(
                __dirname,
                "../../../node_modules/@paypal/paypal-js/dist/v6/esm/paypal-js.js",
            ),
        };
        return config;
    },
    typescript: {
        check: false,
        checkOptions: {},
        reactDocgen: "react-docgen-typescript-plugin",
        reactDocgenTypescriptOptions: {
            // the Storybook docs need this to render the props table for <PayPalButtons />
            compilerOptions: {
                allowSyntheticDefaultImports: false,
                esModuleInterop: false,
            },
        },
    },
};
