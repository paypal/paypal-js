import { mock } from "jest-mock-extended";

import { instanceReducer } from "./InstanceProviderContext";
import {
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
    InstanceState,
    InstanceAction,
} from "../types/InstanceProviderTypes";

import type {
    SdkInstance,
    EligiblePaymentMethodsOutput,
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

function createMockEligiblePaymentMethods(): EligiblePaymentMethodsOutput {
    return {
        isEligible: jest.fn((paymentMethod) => {
            switch (paymentMethod) {
                case "paypal":
                case "credit":
                    return true;
                case "venmo":
                case "paylater":
                default:
                    return false;
            }
        }),
        getDetails: jest.fn((fundingSource) => {
            if (fundingSource === "credit") {
                return {
                    canBeVaulted: true,
                    countryCode: "US",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any;
            }
            if (fundingSource === "paylater") {
                return {
                    canBeVaulted: true,
                    countryCode: "US",
                    productCode: "PAY_IN_4",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any;
            }
            return {
                canBeVaulted: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;
        }),
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

function createInitialState(): InstanceState {
    return {
        sdkInstance: null,
        eligiblePaymentMethods: null,
        loadingStatus: INSTANCE_LOADING_STATE.INITIAL,
        error: null,
        createInstanceOptions: createMockCreateInstanceOptions(),
        scriptOptions: createMockScriptOptions(),
    };
}

describe("instanceReducer", () => {
    let initialState: InstanceState;

    beforeEach(() => {
        initialState = createInitialState();
    });

    describe("SET_LOADING_STATUS action", () => {
        test("should set loadingStatus to PENDING", () => {
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                value: INSTANCE_LOADING_STATE.PENDING,
            };

            const result = instanceReducer(initialState, action);

            expect(result).toEqual({
                ...initialState,
                loadingStatus: INSTANCE_LOADING_STATE.PENDING,
            });
            expect(result).not.toBe(initialState);
        });

        test("should set loadingStatus to RESOLVED", () => {
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                value: INSTANCE_LOADING_STATE.RESOLVED,
            };

            const result = instanceReducer(initialState, action);

            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.RESOLVED);
            expect(result.sdkInstance).toBe(initialState.sdkInstance);
            expect(result.eligiblePaymentMethods).toBe(
                initialState.eligiblePaymentMethods,
            );
            expect(result.error).toBe(initialState.error);
        });

        test("should set loadingStatus to REJECTED", () => {
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                value: INSTANCE_LOADING_STATE.REJECTED,
            };

            const result = instanceReducer(initialState, action);

            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.REJECTED);
        });

        test("should preserve all other state properties", () => {
            const stateWithData = {
                ...initialState,
                sdkInstance: createMockSdkInstance(),
                eligiblePaymentMethods: createMockEligiblePaymentMethods(),
                error: new Error("test error"),
            };

            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                value: INSTANCE_LOADING_STATE.PENDING,
            };

            const result = instanceReducer(stateWithData, action);

            expect(result.sdkInstance).toBe(stateWithData.sdkInstance);
            expect(result.eligiblePaymentMethods).toBe(
                stateWithData.eligiblePaymentMethods,
            );
            expect(result.error).toBe(stateWithData.error);
            expect(result.createInstanceOptions).toBe(
                stateWithData.createInstanceOptions,
            );
            expect(result.scriptOptions).toBe(stateWithData.scriptOptions);
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

        test("should preserve other state properties when setting instance", () => {
            const stateWithData = {
                ...initialState,
                eligiblePaymentMethods: createMockEligiblePaymentMethods(),
                error: new Error("previous error"),
            };

            const mockInstance = createMockSdkInstance();
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_INSTANCE,
                value: mockInstance,
            };

            const result = instanceReducer(stateWithData, action);

            expect(result.sdkInstance).toBe(mockInstance);
            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.RESOLVED);
            expect(result.eligiblePaymentMethods).toBe(
                stateWithData.eligiblePaymentMethods,
            );
            expect(result.error).toBe(stateWithData.error);
            expect(result.createInstanceOptions).toBe(
                stateWithData.createInstanceOptions,
            );
            expect(result.scriptOptions).toBe(stateWithData.scriptOptions);
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

        test("should preserve other state properties when setting eligibility", () => {
            const stateWithData = {
                ...initialState,
                sdkInstance: createMockSdkInstance(),
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                error: new Error("test error"),
            };

            const mockEligibility = createMockEligiblePaymentMethods();
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY,
                value: mockEligibility,
            };

            const result = instanceReducer(stateWithData, action);

            expect(result.eligiblePaymentMethods).toBe(mockEligibility);
            expect(result.sdkInstance).toBe(stateWithData.sdkInstance);
            expect(result.loadingStatus).toBe(stateWithData.loadingStatus);
            expect(result.error).toBe(stateWithData.error);
            expect(result.createInstanceOptions).toBe(
                stateWithData.createInstanceOptions,
            );
            expect(result.scriptOptions).toBe(stateWithData.scriptOptions);
        });
    });

    describe("SET_ERROR action", () => {
        test("should set error and automatically set loadingStatus to REJECTED", () => {
            const testError = new Error("SDK loading failed");
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                value: testError,
            };

            const result = instanceReducer(initialState, action);

            expect(result.error).toBe(testError);
            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.REJECTED);
            expect(result).not.toBe(initialState);
        });

        test("should preserve other state properties when setting error", () => {
            const stateWithData = {
                ...initialState,
                sdkInstance: createMockSdkInstance(),
                eligiblePaymentMethods: createMockEligiblePaymentMethods(),
            };

            const testError = new Error("Instance creation failed");
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                value: testError,
            };

            const result = instanceReducer(stateWithData, action);

            expect(result.error).toBe(testError);
            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.REJECTED);
            expect(result.sdkInstance).toBe(stateWithData.sdkInstance);
            expect(result.eligiblePaymentMethods).toBe(
                stateWithData.eligiblePaymentMethods,
            );
            expect(result.createInstanceOptions).toBe(
                stateWithData.createInstanceOptions,
            );
            expect(result.scriptOptions).toBe(stateWithData.scriptOptions);
        });

        test("should handle different error types", () => {
            const networkError = new TypeError("Network error");
            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_ERROR,
                value: networkError,
            };

            const result = instanceReducer(initialState, action);

            expect(result.error).toBe(networkError);
            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.REJECTED);
        });
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

            const newCreateInstanceOptions: CreateInstanceOptions<
                ["venmo-payments"]
            > = {
                components: ["venmo-payments"],
                clientToken: "new-client-token",
            };
            const newScriptOptions = {
                environment: "production" as const,
            };

            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.RESET_STATE,
                value: {
                    createInstanceOptions: newCreateInstanceOptions,
                    scriptOptions: newScriptOptions,
                },
            };

            const result = instanceReducer(stateWithData, action);

            expect(result.sdkInstance).toBe(null);
            expect(result.eligiblePaymentMethods).toBe(null);
            expect(result.error).toBe(null);
            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
            expect(result.createInstanceOptions).toBe(newCreateInstanceOptions);
            expect(result.scriptOptions).toBe(newScriptOptions);
            expect(result).not.toBe(stateWithData);
        });

        test("should reset from initial state", () => {
            const newCreateInstanceOptions = createMockCreateInstanceOptions();
            const newScriptOptions = createMockScriptOptions();

            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.RESET_STATE,
                value: {
                    createInstanceOptions: newCreateInstanceOptions,
                    scriptOptions: newScriptOptions,
                },
            };

            const result = instanceReducer(initialState, action);

            expect(result.sdkInstance).toBe(null);
            expect(result.eligiblePaymentMethods).toBe(null);
            expect(result.error).toBe(null);
            expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
            expect(result.createInstanceOptions).toBe(newCreateInstanceOptions);
            expect(result.scriptOptions).toBe(newScriptOptions);
        });
    });

    describe("Default case", () => {
        test("should return same state for unknown action", () => {
            const action = { type: "UNKNOWN_ACTION", value: "test" };
            // @ts-expect-error Testing unknown action type
            const result = instanceReducer(initialState, action);

            expect(result).toBe(initialState);
        });

        test("should return same state for empty action", () => {
            const action = {};
            // @ts-expect-error Testing invalid action
            const result = instanceReducer(initialState, action);

            expect(result).toBe(initialState);
        });
    });

    describe("State immutability", () => {
        test("should never mutate the input state", () => {
            const originalState = createInitialState();
            const stateCopy = { ...originalState };

            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                value: INSTANCE_LOADING_STATE.PENDING,
            };

            instanceReducer(originalState, action);

            expect(originalState).toEqual(stateCopy);
        });

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
                    value: {
                        createInstanceOptions:
                            createMockCreateInstanceOptions(),
                        scriptOptions: createMockScriptOptions(),
                    },
                },
            ];

            testCases.forEach((action) => {
                const result = instanceReducer(initialState, action);
                expect(result).not.toBe(initialState);
                expect(typeof result).toBe("object");
            });
        });

        test("should preserve nested object references when not modified", () => {
            const mockOptions = createMockCreateInstanceOptions();
            const mockScriptOptions = createMockScriptOptions();
            const stateWithOptions = {
                ...initialState,
                createInstanceOptions: mockOptions,
                scriptOptions: mockScriptOptions,
            };

            const action: InstanceAction = {
                type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS,
                value: INSTANCE_LOADING_STATE.PENDING,
            };

            const result = instanceReducer(stateWithOptions, action);

            expect(result.createInstanceOptions).toBe(mockOptions);
            expect(result.scriptOptions).toBe(mockScriptOptions);
        });
    });
});
