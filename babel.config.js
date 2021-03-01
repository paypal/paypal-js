module.exports = (api) => {
    const isTest = api.env("test");

    if (isTest) {
        return {
            presets: [
                ["@babel/preset-env", { targets: { node: "current" } }],
                "@babel/preset-typescript",
            ],
        };
    }

    return {
        presets: [
            [
                "@babel/preset-env",
                {
                    useBuiltIns: false,
                    modules: false,
                    exclude: ["@babel/plugin-transform-typeof-symbol"],
                },
            ],
        ],
    };
};
