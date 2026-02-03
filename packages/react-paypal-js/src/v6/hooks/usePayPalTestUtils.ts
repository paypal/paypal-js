import { usePayPal } from "./usePayPal";
import { INSTANCE_LOADING_STATE } from "../types";

import type { PayPalState } from "../context/PayPalProviderContext";

/**
 * Gets the mocked usePayPal function.
 * IMPORTANT: The calling test file must have `jest.mock("./usePayPal")` at the top.
 */
export const getMockUsePayPal = (): jest.MockedFunction<typeof usePayPal> =>
    usePayPal as jest.MockedFunction<typeof usePayPal>;

// Default resolved state - most common test scenario
const defaultPayPalState: PayPalState = {
    sdkInstance: null,
    loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
    eligiblePaymentMethods: null,
    error: null,
    isHydrated: true,
    setEligibility: jest.fn(),
};

/**
 * Override type that allows partial PayPalState with relaxed sdkInstance typing.
 * This accommodates mock SDK instances that don't implement the full SdkInstance interface.
 */
type MockPayPalContextOverrides = Omit<Partial<PayPalState>, "sdkInstance"> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sdkInstance?: any;
};

/**
 * Creates a mock return value for usePayPal with sensible defaults.
 * Only specify the properties you want to override.
 */
export function createMockPayPalContext(
    overrides: MockPayPalContextOverrides = {},
): PayPalState {
    return {
        ...defaultPayPalState,
        ...overrides,
    } as PayPalState;
}

/**
 * Sets up mockUsePayPal with the given overrides.
 * IMPORTANT: The calling test file must have `jest.mock("./usePayPal")` at the top.
 */
export function mockPayPalContext(
    overrides: MockPayPalContextOverrides = {},
): void {
    getMockUsePayPal().mockReturnValue(createMockPayPalContext(overrides));
}

// Pre-built common scenarios
export const mockPayPalPending = (): void =>
    mockPayPalContext({
        loadingStatus: INSTANCE_LOADING_STATE.PENDING,
    });

export const mockPayPalRejected = (): void =>
    mockPayPalContext({
        loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
    });

export const mockPayPalNotHydrated = (): void =>
    mockPayPalContext({
        isHydrated: false,
    });
