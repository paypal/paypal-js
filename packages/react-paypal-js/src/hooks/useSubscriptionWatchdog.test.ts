/**
 * @file useSubscriptionWatchdog.test.ts
 * @description Unit tests for the useSubscriptionWatchdog hook.
 *
 * Uses Jest fake timers to fast-forward through intervals without real delays.
 */
import { renderHook, act } from "@testing-library/react-hooks";
import { useSubscriptionWatchdog } from "./useSubscriptionWatchdog";

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.useFakeTimers();
    sessionStorage.clear();
    // Reset document.hidden to false (page is visible)
    Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => false,
    });
});

afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    sessionStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// Factory helper
// ─────────────────────────────────────────────────────────────────────────────

function buildOptions(overrides: Partial<Parameters<typeof useSubscriptionWatchdog>[0]> = {}) {
    const onSubscriptionConfirmed = jest.fn();
    const onWatchdogTimeout = jest.fn();
    const onPollSubscriptionStatus = jest.fn().mockResolvedValue({
        status: "APPROVAL_PENDING",
        subscriptionId: "",
    });

    return {
        options: {
            enabled: true,
            onSubscriptionConfirmed,
            onWatchdogTimeout,
            onPollSubscriptionStatus,
            timeoutMs: 10_000,
            pollIntervalMs: 2_000,
            ...overrides,
        },
        mocks: { onSubscriptionConfirmed, onWatchdogTimeout, onPollSubscriptionStatus },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests — disabled state
// ─────────────────────────────────────────────────────────────────────────────

describe("when enabled is false", () => {
    it("does not poll even when startWatching is called", async () => {
        const { options, mocks } = buildOptions({ enabled: false });
        const { result } = renderHook(() => useSubscriptionWatchdog(options));

        act(() => {
            result.current.startWatching();
        });

        await act(async () => {
            jest.advanceTimersByTime(20_000);
        });

        expect(mocks.onPollSubscriptionStatus).not.toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests — periodic polling
// ─────────────────────────────────────────────────────────────────────────────

describe("periodic polling", () => {
    it("polls at each pollIntervalMs tick after startWatching", async () => {
        const { options, mocks } = buildOptions();
        const { result } = renderHook(() => useSubscriptionWatchdog(options));

        act(() => result.current.startWatching());

        await act(async () => {
            jest.advanceTimersByTime(2_000); // first tick
            await Promise.resolve();
        });
        expect(mocks.onPollSubscriptionStatus).toHaveBeenCalledTimes(1);

        await act(async () => {
            jest.advanceTimersByTime(2_000); // second tick
            await Promise.resolve();
        });
        expect(mocks.onPollSubscriptionStatus).toHaveBeenCalledTimes(2);
    });

    it("stops polling after stopWatching is called", async () => {
        const { options, mocks } = buildOptions();
        const { result } = renderHook(() => useSubscriptionWatchdog(options));

        act(() => result.current.startWatching());

        await act(async () => {
            jest.advanceTimersByTime(2_000);
            await Promise.resolve();
        });
        expect(mocks.onPollSubscriptionStatus).toHaveBeenCalledTimes(1);

        act(() => result.current.stopWatching());

        await act(async () => {
            jest.advanceTimersByTime(10_000);
            await Promise.resolve();
        });
        // Should still be 1 — no more polls after stop
        expect(mocks.onPollSubscriptionStatus).toHaveBeenCalledTimes(1);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests — success path
// ─────────────────────────────────────────────────────────────────────────────

describe("success path", () => {
    it("calls onSubscriptionConfirmed when poll returns ACTIVE", async () => {
        const { options, mocks } = buildOptions({
            onPollSubscriptionStatus: jest.fn().mockResolvedValue({
                status: "ACTIVE",
                subscriptionId: "I-TEST123",
            }),
        });

        const { result } = renderHook(() => useSubscriptionWatchdog(options));
        act(() => result.current.startWatching());

        await act(async () => {
            jest.advanceTimersByTime(2_000);
            await Promise.resolve();
        });

        expect(mocks.onSubscriptionConfirmed).toHaveBeenCalledWith("I-TEST123");
        expect(mocks.onWatchdogTimeout).not.toHaveBeenCalled();
    });

    it("removes sessionStorage key on confirmed", async () => {
        sessionStorage.setItem("paypal_pending_subscription_id", "pending");
        const { options } = buildOptions({
            onPollSubscriptionStatus: jest.fn().mockResolvedValue({
                status: "ACTIVE",
                subscriptionId: "I-TEST456",
            }),
        });

        const { result } = renderHook(() => useSubscriptionWatchdog(options));
        act(() => result.current.startWatching());

        await act(async () => {
            jest.advanceTimersByTime(2_000);
            await Promise.resolve();
        });

        expect(sessionStorage.getItem("paypal_pending_subscription_id")).toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests — timeout path
// ─────────────────────────────────────────────────────────────────────────────

describe("timeout path", () => {
    it("calls onWatchdogTimeout when timeoutMs elapses without ACTIVE status", async () => {
        const { options, mocks } = buildOptions(); // always returns APPROVAL_PENDING
        const { result } = renderHook(() => useSubscriptionWatchdog(options));
        act(() => result.current.startWatching());

        // Advance past the 10s timeout across multiple intervals
        await act(async () => {
            for (let i = 0; i < 6; i++) {
                jest.advanceTimersByTime(2_000);
                await Promise.resolve();
            }
        });

        expect(mocks.onWatchdogTimeout).toHaveBeenCalledTimes(1);
        expect(mocks.onSubscriptionConfirmed).not.toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests — visibilitychange
// ─────────────────────────────────────────────────────────────────────────────

describe("visibilitychange listener", () => {
    it("polls when page becomes visible while watching", async () => {
        const { options, mocks } = buildOptions();
        const { result } = renderHook(() => useSubscriptionWatchdog(options));
        act(() => result.current.startWatching());

        // Simulate page becoming visible
        act(() => {
            document.dispatchEvent(new Event("visibilitychange"));
        });

        await act(async () => {
            jest.advanceTimersByTime(600); // past the 500ms settle timeout
            await Promise.resolve();
        });

        expect(mocks.onPollSubscriptionStatus).toHaveBeenCalled();
    });

    it("does NOT poll when page becomes visible while NOT watching", async () => {
        const { options, mocks } = buildOptions();
        renderHook(() => useSubscriptionWatchdog(options));
        // Never call startWatching

        act(() => {
            document.dispatchEvent(new Event("visibilitychange"));
        });

        await act(async () => {
            jest.advanceTimersByTime(1_000);
            await Promise.resolve();
        });

        expect(mocks.onPollSubscriptionStatus).not.toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests — page reload recovery
// ─────────────────────────────────────────────────────────────────────────────

describe("page-reload recovery", () => {
    it("polls immediately on mount if sessionStorage has a pending key", async () => {
        sessionStorage.setItem("paypal_pending_subscription_id", "pending");
        const { options, mocks } = buildOptions();

        await act(async () => {
            renderHook(() => useSubscriptionWatchdog(options));
            await Promise.resolve();
        });

        expect(mocks.onPollSubscriptionStatus).toHaveBeenCalledTimes(1);
    });

    it("does NOT poll on mount if no pending key in sessionStorage", async () => {
        const { options, mocks } = buildOptions();

        await act(async () => {
            renderHook(() => useSubscriptionWatchdog(options));
            await Promise.resolve();
        });

        expect(mocks.onPollSubscriptionStatus).not.toHaveBeenCalled();
    });
});
