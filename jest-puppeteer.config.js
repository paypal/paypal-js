const port = 4444;

module.exports = {
    launch: {
        headless: false,
        args: [
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
        ],
    },
    server: {
        command: `npm run test:e2e:start -- --listen=${port}`,
        port,
    },
};
