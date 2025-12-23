import "@testing-library/jest-dom";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import { expectCurrentErrorValue } from "../hooks/useErrorTestUtil";
import { PayPalProvider } from "./PayPalProvider";
import { usePayPal } from "../hooks/usePayPal";
import { useEligibleMethods } from "../hooks/useEligibleMethods";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";

import type { CreateInstanceOptions, PayPalV6Namespace } from "../types";
import type { PayPalState } from "../context/PayPalProviderContext";

// Test constants
export const TEST_CLIENT_TOKEN = "test-client-token";
export const TEST_ERROR_MESSAGE = "test error";
export const TEST_SDK_ELIGIBILITY_RESULT = {
    paypal: { eligible: true },
    venmo: { eligible: false },
};
export const TEST_ELIGIBILITY_HOOK_RESULT = {
    eligible_methods: {
        paypal: {
            can_be_vaulted: true,
            eligible_in_paypal_network: true,
            recommended: true,
            recommended_priority: 1,
        },
        venmo: {
            can_be_vaulted: false,
            eligible_in_paypal_network: true,
        },
    },
    supplementary_data: {
        buyer_country_code: "US",
    },
};

jest.mock("../hooks/useEligibleMethods", () => ({
    useEligibleMethods: jest.fn(),
    fetchEligibleMethods: jest.fn(),
}));

jest.mock("@paypal/paypal-js/sdk-v6", () => ({
    loadCoreSdkScript: jest.fn(),
}));

const createInstanceOptions: CreateInstanceOptions<["paypal-payments"]> = {
    components: ["paypal-payments"],
    clientToken: TEST_CLIENT_TOKEN,
};

function renderProvider(
    props: Partial<React.ComponentProps<typeof PayPalProvider>> = {},
) {
    const { state, TestComponent } = setupTestComponent();

    const {
        children,
        clientToken = createInstanceOptions.clientToken,
        components = createInstanceOptions.components,
        debug = false,
        environment = "sandbox",
        ...restProps
    } = props;

    const result = render(
        <PayPalProvider
            components={components}
            clientToken={clientToken}
            debug={debug}
            environment={environment}
            {...restProps}
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
            .mockResolvedValue(TEST_SDK_ELIGIBILITY_RESULT),
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
        expectCurrentErrorValue(error);
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
        // Set up default mock for useEligibleMethods for all tests
        (useEligibleMethods as jest.Mock).mockReturnValue({
            eligibleMethods: TEST_ELIGIBILITY_HOOK_RESULT,
            isLoading: false,
            error: null,
        });
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

                renderProvider({ environment, ...createInstanceOptions });

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

        test("should use default components array when not provided", async () => {
            const mockCreateInstance = jest
                .fn()
                .mockResolvedValue(createMockSdkInstance());

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            const { state } = renderProvider({
                clientToken: TEST_CLIENT_TOKEN,
            });

            await waitFor(() => expectResolvedState(state));

            expect(mockCreateInstance).toHaveBeenCalledWith(
                expect.objectContaining({
                    components: ["paypal-payments"],
                    clientToken: TEST_CLIENT_TOKEN,
                }),
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
            const { state } = renderProvider(multiComponentOptions);

            await waitFor(() => expectResolvedState(state));

            expect(mockCreateInstance).toHaveBeenCalledWith(
                multiComponentOptions,
            );
        });
    });

    describe("ClientToken Handling", () => {
        test("should wait for clientToken before creating SDK instance", async () => {
            const mockCreateInstance = jest
                .fn()
                .mockResolvedValue(createMockSdkInstance());

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            // Render without clientToken
            const { state, TestComponent } = setupTestComponent();
            const { rerender } = render(
                <PayPalProvider
                    components={["paypal-payments"]}
                    clientToken={undefined}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );

            // Wait for SDK script to load
            await waitFor(() => expect(loadCoreSdkScript).toHaveBeenCalled());

            // Should still be pending because clientToken is not provided
            expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
            expect(mockCreateInstance).not.toHaveBeenCalled();
            expect(state.sdkInstance).toBe(null);

            // Now provide clientToken
            rerender(
                <PayPalProvider
                    components={["paypal-payments"]}
                    clientToken={TEST_CLIENT_TOKEN}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );

            // Should now create instance and resolve
            await waitFor(() => expectResolvedState(state));
            expect(mockCreateInstance).toHaveBeenCalledWith(
                expect.objectContaining({
                    clientToken: TEST_CLIENT_TOKEN,
                }),
            );
        });

        test("should render children immediately even without clientToken", async () => {
            const mockCreateInstance = jest
                .fn()
                .mockResolvedValue(createMockSdkInstance());

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            const childRenderSpy = jest.fn();
            const TestChild = () => {
                childRenderSpy();
                return <div>Test Child Content</div>;
            };

            const { getByText } = render(
                <PayPalProvider
                    components={["paypal-payments"]}
                    clientToken={undefined}
                    environment="sandbox"
                >
                    <TestChild />
                </PayPalProvider>,
            );

            // Children should render immediately
            expect(childRenderSpy).toHaveBeenCalled();
            expect(getByText("Test Child Content")).toBeInTheDocument();

            // But SDK instance should not be created
            await waitFor(() => expect(loadCoreSdkScript).toHaveBeenCalled());
            expect(mockCreateInstance).not.toHaveBeenCalled();
        });

        test("should create instance immediately if clientToken is provided on mount", async () => {
            const mockCreateInstance = jest
                .fn()
                .mockResolvedValue(createMockSdkInstance());

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            const { state } = renderProvider({
                clientToken: TEST_CLIENT_TOKEN,
            });

            // Should create instance right away
            await waitFor(() => expectResolvedState(state));
            expect(mockCreateInstance).toHaveBeenCalledWith(
                expect.objectContaining({
                    clientToken: TEST_CLIENT_TOKEN,
                }),
            );
        });

        test("should handle clientToken changing from undefined to defined", async () => {
            const mockCreateInstance = jest
                .fn()
                .mockResolvedValue(createMockSdkInstance());

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            const { state, TestComponent } = setupTestComponent();
            const { rerender } = render(
                <PayPalProvider
                    components={["paypal-payments"]}
                    clientToken={undefined}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );

            // Wait for SDK script to load
            await waitFor(() => expect(loadCoreSdkScript).toHaveBeenCalled());

            // Should not create instance yet
            expect(mockCreateInstance).not.toHaveBeenCalled();

            // Provide clientToken
            rerender(
                <PayPalProvider
                    components={["paypal-payments"]}
                    clientToken={TEST_CLIENT_TOKEN}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );

            // Should now create instance
            await waitFor(() => expectResolvedState(state));
            expect(mockCreateInstance).toHaveBeenCalledTimes(1);
        });

        test("should recreate instance when clientToken changes", async () => {
            const mockCreateInstance = jest
                .fn()
                .mockResolvedValue(createMockSdkInstance());

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            const { state, TestComponent } = setupTestComponent();
            const { rerender } = render(
                <PayPalProvider
                    components={["paypal-payments"]}
                    clientToken="first-token"
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );

            // Wait for first instance
            await waitFor(() => expectResolvedState(state));
            expect(mockCreateInstance).toHaveBeenCalledWith(
                expect.objectContaining({
                    clientToken: "first-token",
                }),
            );

            // Change clientToken
            rerender(
                <PayPalProvider
                    components={["paypal-payments"]}
                    clientToken="second-token"
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );

            // Should recreate instance with new token
            await waitFor(() => {
                expect(mockCreateInstance).toHaveBeenCalledWith(
                    expect.objectContaining({
                        clientToken: "second-token",
                    }),
                );
            });
            expect(mockCreateInstance).toHaveBeenCalledTimes(2);
        });

        test("should warn after 15 seconds if clientToken is not provided", async () => {
            jest.useFakeTimers();
            const consoleWarnSpy = jest
                .spyOn(console, "warn")
                .mockImplementation(() => {});

            const mockCreateInstance = jest
                .fn()
                .mockResolvedValue(createMockSdkInstance());

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            const { TestComponent } = setupTestComponent();
            render(
                <PayPalProvider
                    components={["paypal-payments"]}
                    clientToken={undefined}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );

            await waitFor(() => expect(loadCoreSdkScript).toHaveBeenCalled());

            // Should not warn before timeout
            jest.advanceTimersByTime(14999);
            expect(consoleWarnSpy).not.toHaveBeenCalled();

            // Should warn after 15 seconds
            jest.advanceTimersByTime(1);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                "clientToken is not available. SDK cannot initialize without clientToken.",
            );

            consoleWarnSpy.mockRestore();
            jest.useRealTimers();
        });
    });

    describe("Eligibility Loading", () => {
        test("should load eligible payment methods", async () => {
            const { state } = renderProvider();

            await waitFor(() =>
                expect(state.eligiblePaymentMethods).toEqual(
                    TEST_ELIGIBILITY_HOOK_RESULT,
                ),
            );
        });

        test("should handle eligibility loading failure gracefully", async () => {
            const mockError = new Error("Eligibility failed");

            // Mock the hook to return an error
            (useEligibleMethods as jest.Mock).mockReturnValue({
                eligibleMethods: null,
                isLoading: false,
                error: mockError,
            });

            const { state } = renderProvider();

            await waitFor(() => expectResolvedState(state));

            // Eligibility error doesn't affect overall state, just no eligibility data
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
