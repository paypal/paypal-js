/**
 * @file mobileDetection.test.ts
 * @description Unit tests for the mobileDetection utility.
 */
import {
    isBrowser,
    isAndroidMobile,
    isAndroidWebView,
    isPostMessageUnreliable,
    supportsPageVisibility,
} from "./mobileDetection";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ANDROID_CHROME_UA =
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36";

const ANDROID_WEBVIEW_UA =
    "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36 wv";

const ANDROID_STOCK_BROWSER_UA =
    "Mozilla/5.0 (Linux; Android 4.4; Nexus 4) AppleWebKit/537.36 Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36";

const IOS_SAFARI_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

const DESKTOP_CHROME_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";

// ─────────────────────────────────────────────────────────────────────────────
// isBrowser
// ─────────────────────────────────────────────────────────────────────────────

describe("isBrowser", () => {
    it("returns true in a jsdom environment", () => {
        expect(isBrowser()).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// isAndroidMobile
// ─────────────────────────────────────────────────────────────────────────────

describe("isAndroidMobile", () => {
    it("returns true for Android Chrome", () => {
        expect(isAndroidMobile(ANDROID_CHROME_UA)).toBe(true);
    });

    it("returns true for Android WebView", () => {
        expect(isAndroidMobile(ANDROID_WEBVIEW_UA)).toBe(true);
    });

    it("returns true for Android stock browser", () => {
        expect(isAndroidMobile(ANDROID_STOCK_BROWSER_UA)).toBe(true);
    });

    it("returns false for iOS Safari", () => {
        expect(isAndroidMobile(IOS_SAFARI_UA)).toBe(false);
    });

    it("returns false for desktop Chrome", () => {
        expect(isAndroidMobile(DESKTOP_CHROME_UA)).toBe(false);
    });

    it("returns false for an empty string", () => {
        expect(isAndroidMobile("")).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// isAndroidWebView
// ─────────────────────────────────────────────────────────────────────────────

describe("isAndroidWebView", () => {
    it("returns true for Android WebView (has wv token)", () => {
        expect(isAndroidWebView(ANDROID_WEBVIEW_UA)).toBe(true);
    });

    it("returns false for Android Chrome (no wv token)", () => {
        expect(isAndroidWebView(ANDROID_CHROME_UA)).toBe(false);
    });

    it("returns false for iOS Safari", () => {
        expect(isAndroidWebView(IOS_SAFARI_UA)).toBe(false);
    });

    it("returns false for desktop Chrome", () => {
        expect(isAndroidWebView(DESKTOP_CHROME_UA)).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// isPostMessageUnreliable
// ─────────────────────────────────────────────────────────────────────────────

describe("isPostMessageUnreliable", () => {
    it("returns true for Android browsers", () => {
        expect(isPostMessageUnreliable(ANDROID_CHROME_UA)).toBe(true);
        expect(isPostMessageUnreliable(ANDROID_WEBVIEW_UA)).toBe(true);
    });

    it("returns false for iOS and desktop", () => {
        expect(isPostMessageUnreliable(IOS_SAFARI_UA)).toBe(false);
        expect(isPostMessageUnreliable(DESKTOP_CHROME_UA)).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// supportsPageVisibility
// ─────────────────────────────────────────────────────────────────────────────

describe("supportsPageVisibility", () => {
    it("returns true when document.hidden is defined (jsdom)", () => {
        // jsdom defines document.hidden
        expect(supportsPageVisibility()).toBe(true);
    });
});
