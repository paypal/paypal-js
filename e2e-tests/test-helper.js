import { setDefaultOptions } from 'expect-puppeteer'
import jestPuppeteerConfig from '../jest-puppeteer.config'

export const timeout = 5000;
setDefaultOptions({ timeout })
jest.setTimeout(timeout)

export const baseURL = process.env.BASE_URL || `http://localhost:${jestPuppeteerConfig.server.port}`
