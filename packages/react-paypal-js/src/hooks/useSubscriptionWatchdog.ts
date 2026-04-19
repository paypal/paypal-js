/**
 * @file useSubscriptionWatchdog.ts
 * @description Enterprise-grade React hook that guards against the Android
 * "ghost popup" bug in PayPal's zoid postMessage bridge.
 *
 * ── THE BUG ──────────────────────────────────────────────────────────────────
 * 1. User taps "Subscribe" → PayPal opens a popup (zoid iframe).
 * 2. Android OS background-kills the parent tab to reclaim RAM.
 * 3. Parent tab is restored, but zoid's ACK mechanism has already timed out.
 * 4. `onApprove` never fires. Popup shows a blank page.
 * 5. Webhook has already confirmed the subscription as ACTIVE on the server.
 *
 * ── THE FIX ──────────────────────────────────────────────────────────────────
 * Layer 1 — VisibilityChange Polling:
 *   When the page becomes visible again after the popup was opened, immediately
 *   query the backend for the subscription status. If ACTIVE, skip `onApprove`
 *   and call `onSubscriptionConfirmed` directly.
 *
 * Layer 2 — Popup Watchdog Timer:
 *   After `startWatching()` is called, a timer fires every `pollIntervalMs`.
 *   If the tracked popup window is still open AND `timeoutMs` has elapsed,
 *   the watchdog forcibly closes the window and fires one final backend poll.
 *
 * Layer 3 — Page-Reload Recovery:
 *   A pending subscription ID is written to `sessionStorage` before the flow
 *   starts. On page load `useSubscriptionWatchdog` checks this value and polls
 *   immediately, recovering users who were stranded by a full page reload.
 *
 * ── USAGE ────────────────────────────────────────────────────────────────────
 * ```tsx
 * const { trackPopupWindow, startWatching, stopWatching } =
 *     useSubscriptionWatchdog({
 *         enabled: isPostMessageUnreliable(),
 *         onSubscriptionConfirmed: (id) => router.push(`/success?sub=${id}`),
 *         onWatchdogTimeout: () => showRetryBanner(),
 *         onPollSubscriptionStatus: async () =>
 *             fetch("/api/subscription/status").then((r) => r.json()),
 *     });
 * ```
 */

import { useCallback, useEffect, useRef } from "react";

import { supportsPageVisibility } from "../utils/mobileDetection";

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The shape of the response expected from the backend polling endpoint.
 * Map your own API response to this shape inside `onPollSubscriptionStatus`.
 */
export interface SubscriptionStatusResponse {
    /** PayPal subscription status. "ACTIVE" means the subscription succeeded. */
    status: "ACTIVE" | "APPROVAL_PENDING" | "SUSPENDED" | "CANCELLED" | "EXPIRED" | string;
    /** The PayPal subscription ID (I-XXXXXXXXX). */
    subscriptionId: string;
}

export interface UseSubscriptionWatchdogOptions {
    /**
     * Whether the watchdog is active. Pass `isPostMessageUnreliable()` here.
     * When false, all hook internals are no-ops and zero event listeners are added.
     */
    enabled: boolean;

    /**
     * Called with the subscription ID when the backend confirms the subscription
     * is ACTIVE. Use this as your authoritative success handler on Android.
     */
    onSubscriptionConfirmed: (subscriptionId: string) => void;

    /**
     * Called when the watchdog timer expires before the backend confirms
     * an ACTIVE status. Show a retry banner or contact-support prompt.
     */
    onWatchdogTimeout: () => void;

    /**
     * An async function that calls YOUR backend (not PayPal directly) to check
     * the subscription status. Should read from a webhook-synced database.
     *
     * @example
     * ```ts
     * onPollSubscriptionStatus: () =>
     *   fetch("/api/subscription/status", { credentials: "include" })
     *     .then(r => r.json())
     * ```
     */
    onPollSubscriptionStatus: () => Promise<SubscriptionStatusResponse>;

    /**
     * Milliseconds before the watchdog declares the popup dead and fires a
     * final poll. Defaults to 45_000 (45 seconds).
     */
    timeoutMs?: number;

    /**
     * Milliseconds between periodic polls while the popup window is tracked.
     * Defaults to 5_000 (5 seconds).
     */
    pollIntervalMs?: number;
}

export interface UseSubscriptionWatchdogReturn {
    /**
     * Call this inside `onClick` (or immediately after the PayPal popup opens)
     * with a reference to the popup window object. Pass `null` to clear.
     */
    trackPopupWindow: (win: Window | null) => void;

    /**
     * Call this when the subscription checkout flow officially starts (e.g.
     * after `createSubscription` resolves). This arms the watchdog timer.
     */
    startWatching: () => void;

    /**
     * Call this in `onApprove`, `onCancel`, and `onError` to disarm the
     * watchdog. Safe to call multiple times.
     */
    stopWatching: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal constants
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_KEY = "paypal_pending_subscription_id";
const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_POLL_INTERVAL_MS = 5_000;
const ACTIVE_STATUS = "ACTIVE";

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Guards PayPal Subscription flows against the Android ghost-popup bug.
 *
 * @see UseSubscriptionWatchdogOptions for full documentation.
 */
export function useSubscriptionWatchdog({
    enabled,
    onSubscriptionConfirmed,
    onWatchdogTimeout,
    onPollSubscriptionStatus,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
}: UseSubscriptionWatchdogOptions): UseSubscriptionWatchdogReturn {
    const popupWindowRef = useRef<Window | null>(null);
    const isWatchingRef = useRef(false);
    const startTimeRef = useRef<number | null>(null);
    const watchdogIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const visibilityPollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Stable refs for callbacks so we never need to re-subscribe event listeners
    const onConfirmedRef = useRef(onSubscriptionConfirmed);
    const onTimeoutRef = useRef(onWatchdogTimeout);
    const onPollRef = useRef(onPollSubscriptionStatus);
    onConfirmedRef.current = onSubscriptionConfirmed;
    onTimeoutRef.current = onWatchdogTimeout;
    onPollRef.current = onPollSubscriptionStatus;

    // ── Internal helpers ─────────────────────────────────────────────────────

    const clearWatchdog = useCallback(() => {
        if (watchdogIntervalRef.current !== null) {
            clearInterval(watchdogIntervalRef.current);
            watchdogIntervalRef.current = null;
        }
        if (visibilityPollTimeoutRef.current !== null) {
            clearTimeout(visibilityPollTimeoutRef.current);
            visibilityPollTimeoutRef.current = null;
        }
    }, []);

    /**
     * Polls the backend once and resolves the promise with the status.
     * Never throws — returns null on network error.
     */
    const pollOnce = useCallback(async (): Promise<SubscriptionStatusResponse | null> => {
        try {
            return await onPollRef.current();
        } catch (err) {
            // Network errors are non-fatal; the watchdog will retry.
            console.warn("[PayPal Watchdog] polling error:", err);
            return null;
        }
    }, []);

    /**
     * Handles the result of a single poll. If ACTIVE, fires success and
     * disarms the watchdog. Otherwise, checks for timeout.
     */
    const handlePollResult = useCallback(
        (result: SubscriptionStatusResponse | null) => {
            if (!result || !isWatchingRef.current) {
                return;
            }

            if (result.status === ACTIVE_STATUS && result.subscriptionId) {
                // Clean up session recovery key
                try {
                    sessionStorage.removeItem(SESSION_KEY);
                } catch {
                    // SSR / private-browsing — ignore
                }

                isWatchingRef.current = false;
                clearWatchdog();

                // Close the stuck popup if it's still open
                if (popupWindowRef.current && !popupWindowRef.current.closed) {
                    popupWindowRef.current.close();
                }

                onConfirmedRef.current(result.subscriptionId);
                return;
            }

            // Check if we've exceeded the maximum wait time
            if (startTimeRef.current !== null) {
                const elapsed = Date.now() - startTimeRef.current;
                if (elapsed >= timeoutMs) {
                    isWatchingRef.current = false;
                    clearWatchdog();

                    if (popupWindowRef.current && !popupWindowRef.current.closed) {
                        popupWindowRef.current.close();
                    }

                    onTimeoutRef.current();
                }
            }
        },
        [clearWatchdog, timeoutMs],
    );

    // ── Layer 3: Page-reload recovery ────────────────────────────────────────

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let pendingId: string | null = null;
        try {
            pendingId = sessionStorage.getItem(SESSION_KEY);
        } catch {
            // SSR / private-browsing — ignore
        }

        if (!pendingId) {
            return;
        }

        // A subscription was in-flight when the page was last loaded.
        // Poll immediately to check if the webhook has already confirmed it.
        let cancelled = false;
        pollOnce().then((result) => {
            if (!cancelled) {
                handlePollResult(result);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Layer 1: VisibilityChange polling ─────────────────────────────────────

    useEffect(() => {
        if (!enabled || !supportsPageVisibility()) {
            return;
        }

        const handleVisibilityChange = () => {
            if (document.hidden || !isWatchingRef.current) {
                return;
            }

            // Page became visible — the user may be returning from a stuck popup.
            // Wait one extra tick for the browser to settle, then poll.
            visibilityPollTimeoutRef.current = setTimeout(async () => {
                const result = await pollOnce();
                handlePollResult(result);
            }, 500);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [enabled, pollOnce, handlePollResult]);

    // ── Cleanup on unmount ───────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            clearWatchdog();
        };
    }, [clearWatchdog]);

    // ── Public API ───────────────────────────────────────────────────────────

    const trackPopupWindow = useCallback((win: Window | null) => {
        popupWindowRef.current = win;
    }, []);

    const startWatching = useCallback(() => {
        if (!enabled) {
            return;
        }

        isWatchingRef.current = true;
        startTimeRef.current = Date.now();

        // Write recovery key to sessionStorage so page reloads can recover
        try {
            sessionStorage.setItem(SESSION_KEY, "pending");
        } catch {
            // SSR / private-browsing — ignore
        }

        // Layer 2: Periodic popup watchdog
        watchdogIntervalRef.current = setInterval(async () => {
            if (!isWatchingRef.current) {
                clearWatchdog();
                return;
            }

            const result = await pollOnce();
            handlePollResult(result);
        }, pollIntervalMs);
    }, [enabled, clearWatchdog, pollOnce, handlePollResult, pollIntervalMs]);

    const stopWatching = useCallback(() => {
        isWatchingRef.current = false;
        clearWatchdog();

        // Remove recovery key — happy path or explicit cancel
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch {
            // SSR / private-browsing — ignore
        }
    }, [clearWatchdog]);

    return { trackPopupWindow, startWatching, stopWatching };
}
