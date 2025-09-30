/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { INSTANCE_LOADING_STATE } from "../types/InstanceProviderTypes";

import type { InstanceContextState } from "../types";

// Test constants
export const TEST_CLIENT_TOKEN = "test-client-token";
export const TEST_ERROR_MESSAGE = "test error";
export const TEST_ELIGIBILITY_RESULT = {
    paypal: { eligible: true },
    venmo: { eligible: false },
};

// Mock factories
export function createMockSdkInstance() {
    return {
        findEligibleMethods: jest
            .fn()
            .mockResolvedValue(TEST_ELIGIBILITY_RESULT),
        createPayPalOneTimePaymentSession: jest.fn(),
        updateLocale: jest.fn(),
    };
}

export function createMockPayPalNamespace() {
    return {
        createInstance: jest.fn().mockResolvedValue(createMockSdkInstance()),
    };
}

// State assertion helpers
export function expectInitialState(state: Partial<InstanceContextState>) {
    expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.INITIAL);
    expect(state.sdkInstance).toBe(null);
    expect(state.eligiblePaymentMethods).toBe(null);
    expect(state.error).toBe(null);
}

export function expectPendingState(state: Partial<InstanceContextState>) {
    expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
}

export function expectResolvedState(state: Partial<InstanceContextState>) {
    expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.RESOLVED);
    expect(state.sdkInstance).toBeTruthy();
    expect(state.error).toBe(null);
}

export function expectRejectedState(
    state: Partial<InstanceContextState>,
    error?: Error,
) {
    expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.REJECTED);
    expect(state.sdkInstance).toBe(null);
    if (error) {
        expect(state.error).toEqual(error);
    }
}

export function expectResetState(state: Partial<InstanceContextState>) {
    expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
    expect(state.sdkInstance).toBe(null);
    expect(state.eligiblePaymentMethods).toBe(null);
    expect(state.error).toBe(null);
}

// Console spy utilities
export function withConsoleSpy(
    method: "error" | "warn" | "log",
    testFn: (spy: jest.SpyInstance) => void | Promise<void>,
) {
    const spy = jest.spyOn(console, method).mockImplementation();
    const result = testFn(spy);

    if (result instanceof Promise) {
        return result.finally(() => spy.mockRestore());
    }

    spy.mockRestore();
}
