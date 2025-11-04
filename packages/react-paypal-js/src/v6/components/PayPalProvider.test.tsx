import "@testing-library/jest-dom";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import { PayPalProvider } from "./PayPalProvider";
import { usePayPal } from "../hooks/usePayPal";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type { CreateInstanceOptions, PayPalV6Namespace } from "../types";
import type { PayPalState } from "../context/PayPalProviderContext";

// Test constants
export const TEST_CLIENT_TOKEN = "test-client-token";
export const TEST_ERROR_MESSAGE = "test error";
export const TEST_ELIGIBILITY_RESULT = {
    paypal: { eligible: true },
    venmo: { eligible: false },
};

jest.mock("@paypal/paypal-js/sdk-v6", () => ({
    loadCoreSdkScript: jest.fn(),
}));

jest.mock("../utils", () => ({
    ...jest.requireActual("../utils"),
    isServer: () => false,
}));

const createInstanceOptions: CreateInstanceOptions<["paypal-payments"]> = {
    components: ["paypal-payments"],
    clientToken: TEST_CLIENT_TOKEN,
};

function renderProvider(
    instanceOptions = createInstanceOptions,
    environment: "sandbox" | "production" = "sandbox",
    debug = false,
    children?: React.ReactNode,
) {
    const { state, TestComponent } = setupTestComponent();

    const result = render(
        <PayPalProvider
            components={instanceOptions.components}
            clientToken={instanceOptions.clientToken}
            environment={environment}
            debug={debug}
        >
            <TestComponent>{children}</TestComponent>
        </PayPalProvider>,
    );

    return { ...result, state };
}

// Mock factories
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function createMockSdkInstance() {
    return {
        findEligibleMethods: jest
            .fn()
            .mockResolvedValue(TEST_ELIGIBILITY_RESULT),
        createPayPalOneTimePaymentSession: jest.fn(),
        updateLocale: jest.fn(),
    };
}

function createMockPayPalNamespace(): PayPalV6Namespace {
    return {
        createInstance: jest.fn().mockResolvedValue(createMockSdkInstance()),
        version: "6.0.0",
    };
}

// State assertion helpers
function expectPendingState(state: Partial<PayPalState>): void {
    expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
}

function expectResolvedState(state: Partial<PayPalState>): void {
    expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.RESOLVED);
    expect(state.sdkInstance).toBeTruthy();
    expect(state.error).toBe(null);
}

function expectRejectedState(state: Partial<PayPalState>, error?: Error): void {
    expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.REJECTED);
    if (error) {
        expect(state.error).toEqual(error);
    }
}
function expectReloadingState(state: Partial<PayPalState>): void {
    // When props change, only loadingStatus is reset to PENDING
    // Old instance and eligibility remain until new ones are loaded
    expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
}

describe("PayPalProvider", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        (loadCoreSdkScript as jest.Mock).mockResolvedValue(
            createMockPayPalNamespace(),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.head.innerHTML = "";
    });

    describe("SDK Loading", () => {
        test("should set loadingStatus to 'resolved' when SDK loads successfully", async () => {
            const { state } = renderProvider();

            expect(loadCoreSdkScript).toHaveBeenCalledWith({
                environment: "sandbox",
                debug: false,
            });

            await waitFor(() => expectResolvedState(state));
        });

        test('should set loadingStatus to "rejected" when SDK fails to load', async () => {
            const mockError = new Error(TEST_ERROR_MESSAGE);
            (loadCoreSdkScript as jest.Mock).mockRejectedValue(mockError);

            const { state } = renderProvider();

            await waitFor(() => expectRejectedState(state, mockError));
        });

        test.each<[string, "sandbox" | "production", string, string]>([
            [
                "sandbox",
                "sandbox",
                "https://www.sandbox.paypal.com/web-sdk/v6/core",
                "sandbox.paypal.com",
            ],
            [
                "production",
                "production",
                "https://www.paypal.com/web-sdk/v6/core",
                "www.paypal.com",
            ],
        ])(
            "should inject script element for %s environment",
            async (_env, environment, scriptSrc, urlFragment) => {
                (loadCoreSdkScript as jest.Mock).mockImplementation(() => {
                    const script = document.createElement("script");
                    script.src = scriptSrc;
                    document.head.appendChild(script);
                    return Promise.resolve(createMockPayPalNamespace());
                });

                renderProvider(createInstanceOptions, environment);

                expect(loadCoreSdkScript).toHaveBeenCalledWith({
                    environment,
                    debug: false,
                });

                await waitFor(() => {
                    const scriptElement = document.querySelector(
                        `script[src*="${urlFragment}"]`,
                    );
                    expect(scriptElement).toBeInTheDocument();
                });
            },
        );
    });

    describe("Instance Creation", () => {
        test("should call createInstance with correct options", async () => {
            const mockCreateInstance = jest
                .fn()
                .mockResolvedValue(createMockSdkInstance());

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            const { state } = renderProvider();

            await waitFor(() => expectResolvedState(state));

            expect(mockCreateInstance).toHaveBeenCalledWith(
                createInstanceOptions,
            );
        });

        test("should handle createInstance failure", async () => {
            const instanceError = new Error("Instance creation failed");
            const mockCreateInstance = jest
                .fn()
                .mockRejectedValue(instanceError);

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            const { state } = renderProvider();

            await waitFor(() => expectRejectedState(state, instanceError));
        });

        test("should work with multiple component types", async () => {
            const multiComponentOptions: CreateInstanceOptions<
                ["paypal-payments", "venmo-payments"]
            > = {
                components: ["paypal-payments", "venmo-payments"],
                clientToken: TEST_CLIENT_TOKEN,
            };

            const mockMultiInstance = {
                ...createMockSdkInstance(),
                createVenmoOneTimePaymentSession: jest.fn(),
            };

            const mockCreateInstance = jest
                .fn()
                .mockResolvedValue(mockMultiInstance);

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });
            // @ts-expect-error renderProvider is typed for single component only
            const { state } = renderProvider(multiComponentOptions);

            await waitFor(() => expectResolvedState(state));

            expect(mockCreateInstance).toHaveBeenCalledWith(
                multiComponentOptions,
            );
        });
    });

    describe("Eligibility Loading", () => {
        test("should load eligible payment methods after instance creation", async () => {
            const { state } = renderProvider();

            await waitFor(() => expectResolvedState(state));

            await waitFor(() =>
                expect(state.eligiblePaymentMethods).toEqual(
                    TEST_ELIGIBILITY_RESULT,
                ),
            );
        });

        test("should handle eligibility loading failure gracefully", async () => {
            const mockError = new Error("Eligibility failed");
            const mockInstance = {
                ...createMockSdkInstance(),
                findEligibleMethods: jest.fn().mockRejectedValue(mockError),
            };

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: jest.fn().mockResolvedValue(mockInstance),
            });

            const { state } = renderProvider();

            await waitFor(() => expectRejectedState(state, mockError));

            expect(state.eligiblePaymentMethods).toBe(null);
        });
    });

    describe("Props Changes", () => {
        test("should reset state when createInstanceOptions change", async () => {
            const { state, TestComponent } = setupTestComponent();

            const { rerender } = render(
                <PayPalProvider
                    components={createInstanceOptions.components}
                    clientToken={createInstanceOptions.clientToken}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );

            // Wait for initial load
            await waitFor(() => expectResolvedState(state));

            // Change the options
            rerender(
                <PayPalProvider
                    components={createInstanceOptions.components}
                    clientToken={"new-client-token"}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );

            // Should go back to pending state (while keeping old instance until new one loads)
            expectReloadingState(state);

            // Should reload with new options
            await waitFor(() => expectResolvedState(state));
        });
    });

    describe("Component Lifecycle", () => {
        test.each<[string, () => void]>([
            [
                "SDK loading",
                () => {
                    let resolveLoad: (
                        value: ReturnType<typeof createMockPayPalNamespace>,
                    ) => void;
                    const loadPromise = new Promise<
                        ReturnType<typeof createMockPayPalNamespace>
                    >((resolve) => {
                        resolveLoad = resolve;
                    });
                    (loadCoreSdkScript as jest.Mock).mockReturnValue(
                        loadPromise,
                    );

                    setTimeout(() => {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        resolveLoad!(createMockPayPalNamespace());
                    }, 100);
                },
            ],
            [
                "instance creation",
                () => {
                    let resolveCreateInstance: (
                        value: ReturnType<typeof createMockSdkInstance>,
                    ) => void;
                    const createInstancePromise = new Promise<
                        ReturnType<typeof createMockSdkInstance>
                    >((resolve) => {
                        resolveCreateInstance = resolve;
                    });

                    (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                        createInstance: jest
                            .fn()
                            .mockReturnValue(createInstancePromise),
                    });

                    setTimeout(() => {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        resolveCreateInstance!(createMockSdkInstance());
                    }, 100);
                },
            ],
        ])(
            "should not update state after component unmounts during %s",
            async (_stage, setupMock) => {
                setupMock();

                const { state, unmount } = renderProvider();

                await waitFor(() => expectPendingState(state));

                // Unmount the component before async operation completes
                unmount();

                // Wait and ensure state wasn't updated
                await waitFor(
                    () => {
                        expectPendingState(state);
                        expect(state.sdkInstance).toBe(null);
                    },
                    { timeout: 500 },
                );
            },
        );
    });
});

describe("Auto-memoization", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        (loadCoreSdkScript as jest.Mock).mockResolvedValue(
            createMockPayPalNamespace(),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.head.innerHTML = "";
    });

    test("should not reload SDK when props have same values but different references", async () => {
        const { state, TestComponent } = setupTestComponent();

        const { rerender } = render(
            <PayPalProvider
                components={createInstanceOptions.components}
                clientToken={createInstanceOptions.clientToken}
                environment="sandbox"
            >
                <TestComponent />
            </PayPalProvider>,
        );

        await waitFor(() => expectResolvedState(state));

        const loadCallCount = (loadCoreSdkScript as jest.Mock).mock.calls
            .length;

        // Rerender with new object reference but same values
        rerender(
            <PayPalProvider
                components={["paypal-payments"]}
                clientToken={TEST_CLIENT_TOKEN}
                environment="sandbox"
            >
                <TestComponent />
            </PayPalProvider>,
        );

        // Wait a bit to ensure no reload happens
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should NOT reload
        expect((loadCoreSdkScript as jest.Mock).mock.calls.length).toBe(
            loadCallCount,
        );
    });

    test("should recreate instance when actual values change", async () => {
        const mockCreateInstance = jest
            .fn()
            .mockResolvedValue(createMockSdkInstance());

        (loadCoreSdkScript as jest.Mock).mockResolvedValue({
            createInstance: mockCreateInstance,
        });

        const { state, TestComponent } = setupTestComponent();

        const { rerender } = render(
            <PayPalProvider
                components={createInstanceOptions.components}
                clientToken={createInstanceOptions.clientToken}
                environment="sandbox"
            >
                <TestComponent />
            </PayPalProvider>,
        );

        await waitFor(() => expectResolvedState(state));

        const createInstanceCallCount = mockCreateInstance.mock.calls.length;

        // Rerender with different client token
        rerender(
            <PayPalProvider
                components={["paypal-payments"]}
                clientToken="NEW-TOKEN"
                environment="sandbox"
            >
                <TestComponent />
            </PayPalProvider>,
        );

        // Should go back to pending state (while keeping old instance until new one loads)
        expectReloadingState(state);

        // Should recreate instance with new token (but NOT reload SDK script)
        await waitFor(() =>
            expect(mockCreateInstance.mock.calls.length).toBe(
                createInstanceCallCount + 1,
            ),
        );

        // Verify new instance was created with new token
        expect(mockCreateInstance).toHaveBeenLastCalledWith(
            expect.objectContaining({
                clientToken: "NEW-TOKEN",
            }),
        );
    });

    test("should handle nested object changes correctly", async () => {
        const { state, TestComponent } = setupTestComponent();

        const complexOptions: CreateInstanceOptions<
            ["paypal-payments", "venmo-payments"]
        > = {
            components: ["paypal-payments", "venmo-payments"],
            clientToken: TEST_CLIENT_TOKEN,
            locale: "en_US",
        };

        const { rerender } = render(
            <PayPalProvider
                components={complexOptions.components}
                clientToken={complexOptions.clientToken}
                locale={complexOptions.locale}
                environment="sandbox"
            >
                <TestComponent />
            </PayPalProvider>,
        );

        await waitFor(() => expectResolvedState(state));

        const loadCallCount = (loadCoreSdkScript as jest.Mock).mock.calls
            .length;

        // Rerender with same values but new object reference
        rerender(
            <PayPalProvider
                components={["paypal-payments", "venmo-payments"]}
                clientToken={TEST_CLIENT_TOKEN}
                locale="en_US"
                environment="sandbox"
            >
                <TestComponent />
            </PayPalProvider>,
        );

        // Wait a bit to ensure no reload happens
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should NOT reload
        expect((loadCoreSdkScript as jest.Mock).mock.calls.length).toBe(
            loadCallCount,
        );
    });
});

function setupTestComponent() {
    const state: PayPalState = {
        loadingStatus: INSTANCE_LOADING_STATE.PENDING,
        sdkInstance: null,
        eligiblePaymentMethods: null,
        error: null,
    };

    function TestComponent({
        children = null,
    }: {
        children?: React.ReactNode;
    }) {
        const instanceState = usePayPal();
        Object.assign(state, instanceState);
        return <>{children}</>;
    }

    return {
        state,
        TestComponent,
    };
}
