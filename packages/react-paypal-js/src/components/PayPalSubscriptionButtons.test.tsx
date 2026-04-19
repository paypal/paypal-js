/**
 * @file PayPalSubscriptionButtons.test.tsx
 * @description Unit & integration tests for the PayPalSubscriptionButtons component.
 */
import React from "react";
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PayPalSubscriptionButtons } from "./PayPalSubscriptionButtons";
import * as mobileDetection from "../utils/mobileDetection";

// ─────────────────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────────────────

// Mock the inner PayPalButtons so tests don't need the PayPal SDK loaded
jest.mock("./PayPalButtons", () => ({
    PayPalButtons: jest.fn(({ createSubscription, onApprove, onCancel, onError, children }) => (
        <div data-testid="mock-paypal-buttons">
            <button
                data-testid="btn-create"
                onClick={() => {
                    createSubscription({}, { subscription: { create: () => Promise.resolve("I-SUB123") } });
                }}
            >
                Create
            </button>
            <button
                data-testid="btn-approve"
                onClick={() => onApprove({ subscriptionID: "I-SUB123" }, {})}
            >
                Approve
            </button>
            <button data-testid="btn-cancel" onClick={() => onCancel()}>
                Cancel
            </button>
            <button
                data-testid="btn-error"
                onClick={() => onError({ message: "SDK error" })}
            >
                Error
            </button>
            {children}
        </div>
    )),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const defaultProps = {
    planId: "P-TEST123",
    returnUrl: "https://example.com/return",
    cancelUrl: "https://example.com/cancel",
    onSubscriptionApproved: jest.fn(),
    onSubscriptionError: jest.fn(),
    pollSubscriptionStatus: jest.fn().mockResolvedValue({
        status: "APPROVAL_PENDING",
        subscriptionId: "",
    }),
    watchdogTimeoutMs: 10_000,
    watchdogPollIntervalMs: 2_000,
};

function renderComponent(overrides: Partial<typeof defaultProps> = {}) {
    const props = { ...defaultProps, ...overrides };
    return { ...render(<PayPalSubscriptionButtons {...props} />), props };
}

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(mobileDetection, "isPostMessageUnreliable").mockReturnValue(false);
    sessionStorage.clear();
    jest.clearAllMocks();
});

afterEach(() => {
    jest.useRealTimers();
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests — rendering
// ─────────────────────────────────────────────────────────────────────────────

describe("rendering", () => {
    it("renders the inner PayPalButtons", () => {
        renderComponent();
        expect(screen.getByTestId("mock-paypal-buttons")).toBeInTheDocument();
    });

    it("has correct displayName", () => {
        expect(PayPalSubscriptionButtons.displayName).toBe("PayPalSubscriptionButtons");
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests — happy path (desktop)
// ─────────────────────────────────────────────────────────────────────────────

describe("happy path — desktop (popup mode)", () => {
    it("calls onSubscriptionApproved with subscriptionID on approve", async () => {
        const onSubscriptionApproved = jest.fn();
        renderComponent({ onSubscriptionApproved });

        await act(async () => {
            fireEvent.click(screen.getByTestId("btn-create"));
            await Promise.resolve();
            fireEvent.click(screen.getByTestId("btn-approve"));
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(onSubscriptionApproved).toHaveBeenCalledWith("I-SUB123");
        });
    });

    it("does NOT call onSubscriptionError on the happy path", async () => {
        const onSubscriptionError = jest.fn();
        renderComponent({ onSubscriptionError });

        await act(async () => {
            fireEvent.click(screen.getByTestId("btn-create"));
            await Promise.resolve();
            fireEvent.click(screen.getByTestId("btn-approve"));
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(onSubscriptionError).not.toHaveBeenCalled();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests — cancel path
// ─────────────────────────────────────────────────────────────────────────────

describe("cancel path", () => {
    it("stops the watchdog on cancel and does not call onSubscriptionApproved", async () => {
        const onSubscriptionApproved = jest.fn();
        renderComponent({ onSubscriptionApproved });

        await act(async () => {
            fireEvent.click(screen.getByTestId("btn-cancel"));
            await Promise.resolve();
        });

        expect(onSubscriptionApproved).not.toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests — error path
// ─────────────────────────────────────────────────────────────────────────────

describe("error path", () => {
    it("calls onSubscriptionError when SDK fires onError", async () => {
        const onSubscriptionError = jest.fn();
        renderComponent({ onSubscriptionError });

        await act(async () => {
            fireEvent.click(screen.getByTestId("btn-error"));
            await Promise.resolve();
        });

        expect(onSubscriptionError).toHaveBeenCalledWith({ message: "SDK error" });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests — forceRedirect prop
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Tests — watchdog integration
// ─────────────────────────────────────────────────────────────────────────────

describe("watchdog integration — Android recovery via backend poll", () => {
    beforeEach(() => {
        jest.spyOn(mobileDetection, "isPostMessageUnreliable").mockReturnValue(true);
    });

    it("calls onSubscriptionApproved via watchdog when backend returns ACTIVE", async () => {
        const onSubscriptionApproved = jest.fn();
        const pollSubscriptionStatus = jest
            .fn()
            .mockResolvedValueOnce({ status: "APPROVAL_PENDING", subscriptionId: "" })
            .mockResolvedValueOnce({ status: "ACTIVE", subscriptionId: "I-WEBHOOK-OK" });

        renderComponent({
            onSubscriptionApproved,
            pollSubscriptionStatus,
            watchdogPollIntervalMs: 500, // Faster polling for test
            watchdogTimeoutMs: 5000,
        });

        // Simulate: user clicks Create -> createSubscription resolves -> startWatching arms
        // (but user is 'stuck' and Approve never fires)
        await act(async () => {
            fireEvent.click(screen.getByTestId("btn-create"));
            await Promise.resolve();
        });

        // Advance through multiple poll intervals
        await act(async () => {
            jest.advanceTimersByTime(600); // 1st poll (PENDING)
            await Promise.resolve();
        });

        await act(async () => {
            jest.advanceTimersByTime(600); // 2nd poll (ACTIVE)
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(onSubscriptionApproved).toHaveBeenCalledWith("I-WEBHOOK-OK");
        });
    });

    it("calls onSubscriptionError when watchdog times out", async () => {
        const onSubscriptionError = jest.fn();
        // pollSubscriptionStatus always returns PENDING
        const pollSubscriptionStatus = jest.fn().mockResolvedValue({
            status: "APPROVAL_PENDING",
            subscriptionId: "",
        });

        renderComponent({
            onSubscriptionError,
            pollSubscriptionStatus,
            watchdogTimeoutMs: 10_000,
            watchdogPollIntervalMs: 2_000,
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId("btn-create"));
            await Promise.resolve();
        });

        // Fast-forward past 10s timeout
        await act(async () => {
            for (let i = 0; i < 6; i++) {
                jest.advanceTimersByTime(2_000);
                await Promise.resolve();
            }
        });

        await waitFor(() => {
            expect(onSubscriptionError).toHaveBeenCalled();
        });
    });
});
