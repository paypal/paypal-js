const port = 4444;

module.exports = {
    launch: {
        headless: false
    },
    server: {
        command: `npm run test:e2e:start -- --port=${port}`,
        port
    }
};
