import { mock } from "jest-mock-extended";

import { instanceReducer } from "./PayPalProviderContext";
import {
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
} from "../types/PayPalProviderEnums";
import { FindEligiblePaymentMethodsResponse } from "../hooks/useEligibleMethods";

import type { PayPalState, InstanceAction } from "./PayPalProviderContext";
import type {
    SdkInstance,
    CreateInstanceOptions,
    LoadCoreSdkScriptOptions,
    Components,
} from "../types";

// Test utilities and mock factories
function createMockSdkInstance() {
    return mock<SdkInstance<readonly [Components, ...Components[]]>>({
        findEligibleMethods: jest.fn().mockResolvedValue({}),
        createPayPalOneTimePaymentSession: jest.fn(),
        updateLocale: jest.fn(),
    });
}

function createMockEligiblePaymentMethods(): FindEligiblePaymentMethodsResponse {
    return {
        eligible_methods: {
            paypal: {
                can_be_vaulted: true,
                eligible_in_paypal_network: true,
                recommended: true,
                recommended_priority: 1,
            },
            paypal_pay_later: {
                can_be_vaulted: false,
                eligible_in_paypal_network: true,
                recommended: true,
                recommended_priority: 2,
                country_code: "US",
                product_code: "PAYLATER",
            },
        },
        supplementary_data: {
            buyer_country_code: "US",
        },
    };
}

function createMockCreateInstanceOptions(): CreateInstanceOptions<
    readonly [Components, ...Components[]]
> {
    return {
        components: ["paypal-payments" as Components],
        clientToken: "test-client-token",
    };
}

function createMockScriptOptions(): LoadCoreSdkScriptOptions {
    return {
        environment: "sandbox",
    };
}

function createInitialState(): PayPalState {
    return {
        sdkInstance: null,
        eligiblePaymentMethods: null,
        loadingStatus: INSTANCE_LOADING_STATE.PENDING,
        error: null,
    };
}

describe("instanceReducer", () => {
    let initialState: PayPalState;

    beforeEach(() => {
        initialState = createInitialState();
    });

    describe("SET_LOADING_STATUS action", () => {
        test.each([
            INSTANCE_LOADING_STATE.PENDING,
            INSTANCE_LOADING_STATE.RESOLVED,
            INSTANCE_LOADING_STATE.REJECTED,
        ])("should set loadingStatus to %s", (status) => {
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                value: status,
            };

            const result = instanceReducer(initialState, action);

            expect(result.loadingStatus).toBe(status);
            expect(result).not.toBe(initialState);
        });
    });

    describe("SET_INSTANCE action", () => {
        test("should set SDK instance and automatically set loadingStatus to RESOLVED", () => {
            const mockInstance = createMockSdkInstance();
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_INSTANCE,
                value: mockInstance,
            };

            const result = instanceReducer(initialState, action);

            expect(result.sdkInstance).toBe(mockInstance);
            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.RESOLVED);
            expect(result).not.toBe(initialState);
        });
    });

    describe("SET_ELIGIBILITY action", () => {
        test("should set eligible payment methods", () => {
            const mockEligibility = createMockEligiblePaymentMethods();
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                value: mockEligibility,
            };

            const result = instanceReducer(initialState, action);

            expect(result.eligiblePaymentMethods).toBe(mockEligibility);
            expect(result).not.toBe(initialState);
        });
    });

    describe("SET_ERROR action", () => {
        test.each([
            ["Error", new Error("SDK loading failed")],
            ["TypeError", new TypeError("Network error")],
        ])(
            "should set error and automatically set loadingStatus to REJECTED for %s",
            (_name, error) => {
                const action: InstanceAction = {
                    type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                    value: error,
                };

                const result = instanceReducer(initialState, action);

                expect(result.error).toBe(error);
                expect(result.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.REJECTED,
                );
                expect(result).not.toBe(initialState);
            },
        );
    });

    describe("RESET_STATE action", () => {
        test("should reset state with new options", () => {
            const stateWithData = {
                ...initialState,
                sdkInstance: createMockSdkInstance(),
                eligiblePaymentMethods: createMockEligiblePaymentMethods(),
                error: new Error("previous error"),
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
            };

            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.RESET_STATE,
            };

            const result = instanceReducer(stateWithData, action);

            expect(result.sdkInstance).toBe(null);
            expect(result.eligiblePaymentMethods).toBe(null);
            expect(result.error).toBe(null);
            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
            expect(result).not.toBe(stateWithData);
        });

        test("should reset from initial state", () => {
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.RESET_STATE,
            };

            const result = instanceReducer(initialState, action);

            expect(result.sdkInstance).toBe(null);
            expect(result.eligiblePaymentMethods).toBe(null);
            expect(result.error).toBe(null);
            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
        });
    });

    describe("Invalid actions", () => {
        test("should return same state for unknown action type", () => {
            const result = instanceReducer(initialState, {
                // @ts-expect-error invalid action type
                type: "UNKNOWN_ACTION",
                // @ts-expect-error invalid component value
                value: "test",
            });

            expect(result).toBe(initialState);
        });
    });

    describe("State immutability and preservation", () => {
        test("should return new state object for all valid actions", () => {
            const testCases: InstanceAction[] = [
                {
                    type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                    value: INSTANCE_LOADING_STATE.PENDING,
                },
                {
                    type: INSTANCE_DISPATCH_ACTION.SET_INSTANCE,
                    value: createMockSdkInstance(),
                },
                {
                    type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                    value: createMockEligiblePaymentMethods(),
                },
                {
                    type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                    value: new Error("test"),
                },
                {
                    type: INSTANCE_DISPATCH_ACTION.RESET_STATE,
                },
            ];

            testCases.forEach((action) => {
                const result = instanceReducer(initialState, action);
                expect(result).not.toBe(initialState);
            });
        });

        test.each<[string, InstanceAction]>([
            [
                "SET_LOADING_STATUS",
                {
                    type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                    value: INSTANCE_LOADING_STATE.PENDING,
                },
            ],
            [
                "SET_INSTANCE",
                {
                    type: INSTANCE_DISPATCH_ACTION.SET_INSTANCE,
                    value: createMockSdkInstance(),
                },
            ],
            [
                "SET_ELIGIBILITY",
                {
                    type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                    value: createMockEligiblePaymentMethods(),
                },
            ],
            [
                "SET_ERROR",
                {
                    type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                    value: new Error("test"),
                },
            ],
        ])(
            "should preserve unmodified state properties for %s action",
            (_name, action) => {
                const mockInstance = createMockSdkInstance();
                const mockEligibility = createMockEligiblePaymentMethods();
                const mockOptions = createMockCreateInstanceOptions();
                const mockScriptOptions = createMockScriptOptions();

                const stateWithData = {
                    ...initialState,
                    sdkInstance: mockInstance,
                    eligiblePaymentMethods: mockEligibility,
                    createInstanceOptions: mockOptions,
                    scriptOptions: mockScriptOptions,
                };

                const result = instanceReducer(stateWithData, action);

                // Verify unmodified properties maintain reference equality
                if (action.type !== INSTANCE_DISPATCH_ACTION.SET_INSTANCE) {
                    expect(result.sdkInstance).toBe(mockInstance);
                }
                if (action.type !== INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY) {
                    expect(result.eligiblePaymentMethods).toBe(mockEligibility);
                }
            },
        );
    });
});
