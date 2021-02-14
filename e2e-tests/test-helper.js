import { setDefaultOptions } from "expect-puppeteer";
import jestPuppeteerConfig from "../jest-puppeteer.config";
import pkg from "../package.json";

export const timeout = 10000;
setDefaultOptions({ timeout });
jest.setTimeout(timeout);

export const baseURL =
    process.env.BASE_URL ||
    `http://localhost:${jestPuppeteerConfig.server.port}`;

export const version = pkg.version;
