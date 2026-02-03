import "@testing-library/jest-dom";
import React from "react";
import { act, render, waitFor } from "@testing-library/react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import { expectCurrentErrorValue } from "../hooks/useErrorTestUtil";
import { PayPalProvider } from "./PayPalProvider";
import { usePayPal } from "../hooks/usePayPal";
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

jest.mock("@paypal/paypal-js/sdk-v6", () => ({
    loadCoreSdkScript: jest.fn(),
}));

const createInstanceOptions: CreateInstanceOptions<["paypal-payments"]> = {
    components: ["paypal-payments"],
    clientToken: TEST_CLIENT_TOKEN,
};

async function renderProvider(
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

    let result: ReturnType<typeof render>;

    await act(async () => {
        result = render(
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
    });

    return { ...result!, state };
}

// Mock factories
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function createMockSdkInstance() {
    return {
        findEligibleMethods: jest
            .fn()
            .mockResolvedValue(TEST_SDK_ELIGIBILITY_RESULT),
        hydrateEligibleMethods: jest
            .fn()
            .mockReturnValue(TEST_SDK_ELIGIBILITY_RESULT),
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
            const { state } = await renderProvider();

            expect(loadCoreSdkScript).toHaveBeenCalledWith({
                environment: "sandbox",
                debug: false,
            });

            await waitFor(() => expectResolvedState(state));
        });

        test('should set loadingStatus to "rejected" when SDK fails to load', async () => {
            const mockError = new Error(TEST_ERROR_MESSAGE);
            (loadCoreSdkScript as jest.Mock).mockRejectedValue(mockError);

            const { state } = await renderProvider();

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

                await renderProvider({ environment, ...createInstanceOptions });

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

            const { state } = await renderProvider();

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

            const { state } = await renderProvider({
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

            const { state } = await renderProvider();

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
            const { state } = await renderProvider(multiComponentOptions);

            await waitFor(() => expectResolvedState(state));

            expect(mockCreateInstance).toHaveBeenCalledWith(
                multiComponentOptions,
            );
        });
    });

    describe("ClientToken Handling", () => {
        test("should wait for clientToken and render children immediately", async () => {
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

            const { state, TestComponent } = setupTestComponent();
            let rerender: ReturnType<typeof render>["rerender"];
            let getByText: ReturnType<typeof render>["getByText"];

            await act(async () => {
                const result = render(
                    <PayPalProvider
                        components={["paypal-payments"]}
                        clientToken={undefined}
                        environment="sandbox"
                    >
                        <TestComponent>
                            <TestChild />
                        </TestComponent>
                    </PayPalProvider>,
                );
                rerender = result.rerender;
                getByText = result.getByText;
            });

            expect(childRenderSpy).toHaveBeenCalled();
            expect(getByText!("Test Child Content")).toBeInTheDocument();
            expect(loadCoreSdkScript).not.toHaveBeenCalled();
            expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
            expect(state.sdkInstance).toBe(null);

            await act(async () => {
                rerender!(
                    <PayPalProvider
                        components={["paypal-payments"]}
                        clientToken={TEST_CLIENT_TOKEN}
                        environment="sandbox"
                    >
                        <TestComponent>
                            <TestChild />
                        </TestComponent>
                    </PayPalProvider>,
                );
            });

            await waitFor(() => expect(loadCoreSdkScript).toHaveBeenCalled());
            await waitFor(() => expectResolvedState(state));
            expect(mockCreateInstance).toHaveBeenCalledWith(
                expect.objectContaining({
                    clientToken: TEST_CLIENT_TOKEN,
                }),
            );
        });

        test("should create instance immediately if clientToken is provided on mount", async () => {
            const mockCreateInstance = jest
                .fn()
                .mockResolvedValue(createMockSdkInstance());

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            const { state } = await renderProvider({
                clientToken: TEST_CLIENT_TOKEN,
            });

            await waitFor(() => expectResolvedState(state));
            expect(mockCreateInstance).toHaveBeenCalledWith(
                expect.objectContaining({
                    clientToken: TEST_CLIENT_TOKEN,
                }),
            );
        });

        test("should handle Promise rejection for clientToken", async () => {
            const tokenError = new Error("Token fetch failed");
            const tokenPromise = Promise.reject(tokenError);

            tokenPromise.catch(() => {});

            const { state } = await renderProvider({
                clientToken: tokenPromise,
            });

            await waitFor(() => {
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.REJECTED,
                );
                expect(state.error?.message).toBe(
                    "Failed to resolve clientToken. Expected a Promise that resolves to a string, but it was rejected with: Token fetch failed",
                );
            });
            expect(loadCoreSdkScript).not.toHaveBeenCalled();
        });

        test("should resolve Promise and load SDK when clientToken is a Promise", async () => {
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

            let resolveToken: (value: string) => void;
            const tokenPromise = new Promise<string>((resolve) => {
                resolveToken = resolve;
            });

            const { state, TestComponent } = setupTestComponent();
            let getByText: ReturnType<typeof render>["getByText"];

            await act(async () => {
                const result = render(
                    <PayPalProvider
                        components={["paypal-payments"]}
                        clientToken={tokenPromise}
                        environment="sandbox"
                    >
                        <TestComponent>
                            <TestChild />
                        </TestComponent>
                    </PayPalProvider>,
                );
                getByText = result.getByText;
            });

            expect(childRenderSpy).toHaveBeenCalled();
            expect(getByText!("Test Child Content")).toBeInTheDocument();
            expect(loadCoreSdkScript).not.toHaveBeenCalled();

            await act(async () => {
                resolveToken!(TEST_CLIENT_TOKEN);
            });

            await waitFor(() => expect(loadCoreSdkScript).toHaveBeenCalled());
            await waitFor(() => expectResolvedState(state));
        });
    });

    describe("Eligibility Loading", () => {
        test("should not call findEligibleMethods when no eligibleMethodsResponse is provided", async () => {
            const mockFindEligibleMethods = jest
                .fn()
                .mockResolvedValue(TEST_SDK_ELIGIBILITY_RESULT);
            const mockInstance = {
                ...createMockSdkInstance(),
                findEligibleMethods: mockFindEligibleMethods,
            };

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: jest.fn().mockResolvedValue(mockInstance),
            });

            const { state } = await renderProvider();

            await waitFor(() => expectResolvedState(state));

            // Provider no longer automatically calls findEligibleMethods
            // Client-side fetching should be done via useFetchEligibleMethods hook
            expect(mockFindEligibleMethods).not.toHaveBeenCalled();
            expect(state.eligiblePaymentMethods).toBeNull();
        });

        test("should call hydrateEligibleMethods when eligibleMethodsResponse is provided", async () => {
            const mockHydrateEligibleMethods = jest
                .fn()
                .mockReturnValue(TEST_SDK_ELIGIBILITY_RESULT);
            const mockFindEligibleMethods = jest
                .fn()
                .mockResolvedValue(TEST_SDK_ELIGIBILITY_RESULT);
            const mockInstance = {
                ...createMockSdkInstance(),
                hydrateEligibleMethods: mockHydrateEligibleMethods,
                findEligibleMethods: mockFindEligibleMethods,
            };

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: jest.fn().mockResolvedValue(mockInstance),
            });

            const { state } = await renderProvider({
                eligibleMethodsResponse: TEST_ELIGIBILITY_HOOK_RESULT,
            });

            await waitFor(() => expectResolvedState(state));

            expect(mockHydrateEligibleMethods).toHaveBeenCalledWith(
                TEST_ELIGIBILITY_HOOK_RESULT,
            );
            expect(mockFindEligibleMethods).not.toHaveBeenCalled();
            await waitFor(() =>
                expect(state.eligiblePaymentMethods).toEqual(
                    TEST_SDK_ELIGIBILITY_RESULT,
                ),
            );
        });

        test("should store eligibility result in context state when eligibleMethodsResponse is provided", async () => {
            const eligibilityResult = {
                paypal: { eligible: true, recommended: true },
                venmo: { eligible: false },
            };

            const mockHydrateEligibleMethods = jest
                .fn()
                .mockReturnValue(eligibilityResult);
            const mockInstance = {
                ...createMockSdkInstance(),
                hydrateEligibleMethods: mockHydrateEligibleMethods,
            };

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: jest.fn().mockResolvedValue(mockInstance),
            });

            const { state } = await renderProvider({
                eligibleMethodsResponse: TEST_ELIGIBILITY_HOOK_RESULT,
            });

            await waitFor(() => expectResolvedState(state));
            await waitFor(() =>
                expect(state.eligiblePaymentMethods).toEqual(eligibilityResult),
            );
        });

        test("should not run eligibility hydration effect until sdkInstance is available", async () => {
            const mockHydrateEligibleMethods = jest
                .fn()
                .mockReturnValue(TEST_SDK_ELIGIBILITY_RESULT);
            const mockInstance = {
                ...createMockSdkInstance(),
                hydrateEligibleMethods: mockHydrateEligibleMethods,
            };

            let resolveCreateInstance: (value: typeof mockInstance) => void;
            const createInstancePromise = new Promise<typeof mockInstance>(
                (resolve) => {
                    resolveCreateInstance = resolve;
                },
            );

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: jest
                    .fn()
                    .mockReturnValue(createInstancePromise),
            });

            const { state, TestComponent } = setupTestComponent();

            await act(async () => {
                render(
                    <PayPalProvider
                        components={["paypal-payments"]}
                        clientToken={TEST_CLIENT_TOKEN}
                        environment="sandbox"
                        eligibleMethodsResponse={TEST_ELIGIBILITY_HOOK_RESULT}
                    >
                        <TestComponent />
                    </PayPalProvider>,
                );
            });

            // hydrateEligibleMethods should not be called yet
            expect(mockHydrateEligibleMethods).not.toHaveBeenCalled();
            expect(state.eligiblePaymentMethods).toBe(null);

            // Resolve instance creation
            await act(async () => {
                resolveCreateInstance!(mockInstance);
            });

            await waitFor(() => {
                expect(mockHydrateEligibleMethods).toHaveBeenCalledWith(
                    TEST_ELIGIBILITY_HOOK_RESULT,
                );
            });
        });

        test("should update eligibility when eligibleMethodsResponse prop changes", async () => {
            const hydrateResult1 = { paypal: { eligible: true } };
            const hydrateResult2 = {
                paypal: { eligible: true },
                venmo: { eligible: true },
            };

            const mockHydrateEligibleMethods = jest
                .fn()
                .mockReturnValueOnce(hydrateResult1)
                .mockReturnValueOnce(hydrateResult2);

            const mockInstance = {
                ...createMockSdkInstance(),
                hydrateEligibleMethods: mockHydrateEligibleMethods,
            };

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: jest.fn().mockResolvedValue(mockInstance),
            });

            const initialResponse = {
                eligible_methods: { paypal: { can_be_vaulted: true } },
            };
            const updatedResponse = {
                eligible_methods: {
                    paypal: { can_be_vaulted: true },
                    venmo: { can_be_vaulted: false },
                },
            };

            const { state, TestComponent } = setupTestComponent();
            let rerender: ReturnType<typeof render>["rerender"];

            await act(async () => {
                const result = render(
                    <PayPalProvider
                        components={["paypal-payments"]}
                        clientToken={TEST_CLIENT_TOKEN}
                        environment="sandbox"
                        eligibleMethodsResponse={initialResponse}
                    >
                        <TestComponent />
                    </PayPalProvider>,
                );
                rerender = result.rerender;
            });

            await waitFor(() =>
                expect(state.eligiblePaymentMethods).toEqual(hydrateResult1),
            );

            await act(async () => {
                rerender!(
                    <PayPalProvider
                        components={["paypal-payments"]}
                        clientToken={TEST_CLIENT_TOKEN}
                        environment="sandbox"
                        eligibleMethodsResponse={updatedResponse}
                    >
                        <TestComponent />
                    </PayPalProvider>,
                );
            });

            await waitFor(() =>
                expect(state.eligiblePaymentMethods).toEqual(hydrateResult2),
            );
            expect(mockHydrateEligibleMethods).toHaveBeenCalledTimes(2);
        });

        test("should handle error when hydrateEligibleMethods fails", async () => {
            const mockError = new Error("hydrateEligibleMethods failed");
            const mockHydrateEligibleMethods = jest
                .fn()
                .mockImplementation(() => {
                    throw mockError;
                });
            const mockInstance = {
                ...createMockSdkInstance(),
                hydrateEligibleMethods: mockHydrateEligibleMethods,
            };

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: jest.fn().mockResolvedValue(mockInstance),
            });

            const { state } = await renderProvider({
                eligibleMethodsResponse: TEST_ELIGIBILITY_HOOK_RESULT,
            });

            await waitFor(() => expectRejectedState(state, mockError));
            expect(state.eligiblePaymentMethods).toBe(null);
        });
    });

    describe("Props Changes", () => {
        test("should reset state when createInstanceOptions change", async () => {
            const { state, TestComponent } = setupTestComponent();
            let rerender: ReturnType<typeof render>["rerender"];

            await act(async () => {
                const result = render(
                    <PayPalProvider
                        components={createInstanceOptions.components}
                        clientToken={createInstanceOptions.clientToken}
                        environment="sandbox"
                    >
                        <TestComponent />
                    </PayPalProvider>,
                );
                rerender = result.rerender;
            });

            // Wait for initial load
            await waitFor(() => expectResolvedState(state));

            // Change the options
            await act(async () => {
                rerender!(
                    <PayPalProvider
                        components={createInstanceOptions.components}
                        clientToken={"new-client-token"}
                        environment="sandbox"
                    >
                        <TestComponent />
                    </PayPalProvider>,
                );
            });

            // Should reload with new options and reach resolved state
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

                const { state, unmount } = await renderProvider();

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
        let rerender: ReturnType<typeof render>["rerender"];

        await act(async () => {
            const result = render(
                <PayPalProvider
                    components={createInstanceOptions.components}
                    clientToken={createInstanceOptions.clientToken}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );
            rerender = result.rerender;
        });

        await waitFor(() => expectResolvedState(state));

        const loadCallCount = (loadCoreSdkScript as jest.Mock).mock.calls
            .length;

        // Rerender with new object reference but same values
        await act(async () => {
            rerender!(
                <PayPalProvider
                    components={["paypal-payments"]}
                    clientToken={TEST_CLIENT_TOKEN}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );
        });

        // Wait a bit to ensure no reload happens
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

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
        let rerender: ReturnType<typeof render>["rerender"];

        await act(async () => {
            const result = render(
                <PayPalProvider
                    components={createInstanceOptions.components}
                    clientToken={createInstanceOptions.clientToken}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );
            rerender = result.rerender;
        });

        await waitFor(() => expectResolvedState(state));

        const createInstanceCallCount = mockCreateInstance.mock.calls.length;

        // Rerender with different client token
        await act(async () => {
            rerender!(
                <PayPalProvider
                    components={["paypal-payments"]}
                    clientToken="NEW-TOKEN"
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );
        });

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

        let rerender: ReturnType<typeof render>["rerender"];

        await act(async () => {
            const result = render(
                <PayPalProvider
                    components={complexOptions.components}
                    clientToken={complexOptions.clientToken}
                    locale={complexOptions.locale}
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );
            rerender = result.rerender;
        });

        await waitFor(() => expectResolvedState(state));

        const loadCallCount = (loadCoreSdkScript as jest.Mock).mock.calls
            .length;

        // Rerender with same values but new object reference
        await act(async () => {
            rerender!(
                <PayPalProvider
                    components={["paypal-payments", "venmo-payments"]}
                    clientToken={TEST_CLIENT_TOKEN}
                    locale="en_US"
                    environment="sandbox"
                >
                    <TestComponent />
                </PayPalProvider>,
            );
        });

        // Wait a bit to ensure no reload happens
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

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
        isHydrated: false,
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
