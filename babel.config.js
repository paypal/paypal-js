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
                    useBuiltIns: 'usage',
                    corejs: {
                        version: '3.6',
                        proposals: true
                    },
                    modules: false,
                    exclude: [
                        "es.promise"
                    ]
                }
            ]
        ]
    };
};
