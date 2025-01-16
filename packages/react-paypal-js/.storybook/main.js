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
