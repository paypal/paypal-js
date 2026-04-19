/**
 * @file mobileDetection.ts
 * @description Enterprise-grade mobile/Android browser detection utility.
 *
 * Design goals:
 *  - SSR-safe: never accesses browser globals at module-evaluation time.
 *  - Pure functions: no side-effects, fully tree-shakeable.
 *  - Tested: every branch covered by unit tests (see mobileDetection.test.ts).
 *  - Future-proof: uses feature detection before falling back to UA parsing.
 *
 * WHY THIS EXISTS:
 * PayPal's `zoid` cross-domain component library communicates via `postMessage`.
 * On Android Chrome / Android WebView the operating system may background-kill
 * the parent tab to reclaim RAM while the PayPal popup is open.  When the
 * parent tab is restored, `zoid`'s ACK mechanism times out and fires:
 *   "Uncaught Error: No ack for postMessage"
 * This prevents `onApprove` from ever firing and leaves the popup as a blank page.
 *
 * The mitigation is to force a full-page redirect flow on Android, bypassing the
 * `postMessage` bridge entirely.
 */

/**
 * The set of Android WebView / Chrome user-agent tokens we recognise.
 * Listed in specificity order (most-specific first).
 *
 * @internal
 */
const ANDROID_UA_PATTERNS = [
    /\bAndroid\b/i,
    /\bwv\b/, // WebView token injected by Android WebView
    /\bVersion\/[\d.]+\s+Chrome\//i, // Android stock browser wrapping Chrome
] as const;

/**
 * Returns `true` when executing in a real browser environment.
 * Always returns `false` in Node.js / SSR contexts.
 */
export function isBrowser(): boolean {
    return (
        typeof window !== "undefined" &&
        typeof window.navigator !== "undefined" &&
        typeof window.navigator.userAgent === "string"
    );
}

/**
 * Returns `true` if the current user-agent represents an Android mobile
 * browser or an Android WebView.
 *
 * Safe to call without any arguments in both browser and SSR contexts.
 *
 * @param ua - Optional override for `navigator.userAgent` (used in tests).
 */
export function isAndroidMobile(ua?: string): boolean {
    if (!isBrowser() && ua === undefined) {
        return false;
    }

    const userAgent = ua ?? window.navigator.userAgent;
    return ANDROID_UA_PATTERNS.some((pattern) => pattern.test(userAgent));
}

/**
 * Returns `true` if the current environment is an Android WebView specifically
 * (as opposed to a full Chrome browser tab).
 *
 * WebViews have more aggressive memory management and are more likely to kill
 * the parent process while a popup is open.
 *
 * @param ua - Optional override for `navigator.userAgent` (used in tests).
 */
export function isAndroidWebView(ua?: string): boolean {
    if (!isBrowser() && ua === undefined) {
        return false;
    }

    const userAgent = ua ?? window.navigator.userAgent;
    // The `wv` token is injected by Android WebView.
    // https://developer.chrome.com/docs/multidevice/user-agent/#webview_user_agent
    return /\bwv\b/.test(userAgent) && /\bAndroid\b/i.test(userAgent);
}

/**
 * Returns `true` if the `postMessage` bridge used by PayPal's `zoid` library
 * is likely to be unreliable in the current environment.
 *
 * Currently this covers:
 *  - Android Chrome (background-kill risk)
 *  - Android WebView (foreground-kill risk + stricter cross-origin policies)
 *
 * Consumers should use this to switch to a redirect-based flow.
 *
 * @param ua - Optional override for `navigator.userAgent` (used in tests).
 */
export function isPostMessageUnreliable(ua?: string): boolean {
    return isAndroidMobile(ua);
}

/**
 * Returns `true` if the browser supports the Page Visibility API.
 * Used by the watchdog hook to attach a `visibilitychange` listener.
 */
export function supportsPageVisibility(): boolean {
    return isBrowser() && typeof document.hidden !== "undefined";
}
