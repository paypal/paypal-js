const port = new URL(process.env.BASE_URL).port;

module.exports = {
    launch: {
        headless: false,
        args: [
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
        ],
    },
    server: {
        command: `npm run test:e2e:start -- ${port}`,
        port,
    },
};
