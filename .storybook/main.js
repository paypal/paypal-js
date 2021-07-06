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
                controls: false,
                actions: false,
            },
        },
    ],
    typescript: {
        check: false,
        checkOptions: {},
        reactDocgen: "react-docgen-typescript",
        reactDocgenTypescriptOptions: {
            // the Storybook docs need this to render the props table for <PayPalButtons />
            compilerOptions: {
                allowSyntheticDefaultImports: false,
                esModuleInterop: false,
            },
        },
    },
};
