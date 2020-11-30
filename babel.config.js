module.exports = api => {
    const isTest = api.env('test');

    if (isTest) {
        return {
            presets: [
                [
                    '@babel/preset-env', { targets: { node: 'current' } }
                ]
            ]
        };
    }

    return {
        presets: [

            [
                '@babel/preset-env',
                {
                    useBuiltIns: false,
                    modules: false
                }
            ]
        ]
    };
};
