/* eslint @typescript-eslint/no-var-requires: "off" */

const { setDefaultOptions } = require("expect-puppeteer");

const timeout = 10000;
setDefaultOptions({ timeout });
jest.setTimeout(timeout);
