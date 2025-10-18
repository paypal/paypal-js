import "@testing-library/jest-dom";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import { PayPalProvider } from "./PayPalProvider";
import { usePayPal } from "../hooks/usePayPal";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";
import {
    TEST_CLIENT_TOKEN,
    TEST_ERROR_MESSAGE,
    TEST_ELIGIBILITY_RESULT,
    createMockSdkInstance,
    createMockPayPalNamespace,
    expectPendingState,
    expectResolvedState,
    expectRejectedState,
    expectResetState,
    withConsoleSpy,
} from "./providerTestUtils";

import type {
    CreateInstanceOptions,
    LoadCoreSdkScriptOptions,
    PayPalContextState,
} from "../types";

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

const scriptOptions: LoadCoreSdkScriptOptions = {
    environment: "sandbox",
};

function renderProvider(
    instanceOptions = createInstanceOptions,
    scriptOpts = scriptOptions,
    children?: React.ReactNode,
) {
    const { state, TestComponent } = setupTestComponent();

    const result = render(
        <PayPalProvider
            components={instanceOptions.components}
            clientToken={instanceOptions.clientToken}
            scriptOptions={scriptOpts}
        >
            <TestComponent>{children}</TestComponent>
        </PayPalProvider>,
    );

    return { ...result, state };
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
        test("should transition to PENDING on client mount (hydration-safe)", async () => {
            const { state } = renderProvider();

            await waitFor(() => expectPendingState(state));
        });

        test("should set loadingStatus to 'resolved' when SDK loads successfully", async () => {
            const { state } = renderProvider();

            expect(loadCoreSdkScript).toHaveBeenCalledWith(scriptOptions);

            await waitFor(() => expectResolvedState(state));
        });

        test('should set loadingStatus to "rejected" when SDK fails to load', async () => {
            await withConsoleSpy("error", async () => {
                (loadCoreSdkScript as jest.Mock).mockRejectedValue(
                    new Error(TEST_ERROR_MESSAGE),
                );

                const { state } = renderProvider();

                await waitFor(() =>
                    expectRejectedState(state, new Error(TEST_ERROR_MESSAGE)),
                );
            });
        });

        test.each<[string, LoadCoreSdkScriptOptions, string, string]>([
            [
                "sandbox",
                { environment: "sandbox" },
                "https://www.sandbox.paypal.com/web-sdk/v6/core",
                "sandbox.paypal.com",
            ],
            [
                "production",
                { environment: "production" },
                "https://www.paypal.com/web-sdk/v6/core",
                "www.paypal.com",
            ],
        ])(
            "should inject script element for %s environment",
            async (_env, options, scriptSrc, urlFragment) => {
                (loadCoreSdkScript as jest.Mock).mockImplementation(() => {
                    const script = document.createElement("script");
                    script.src = scriptSrc;
                    document.head.appendChild(script);
                    return Promise.resolve(createMockPayPalNamespace());
                });

                renderProvider(createInstanceOptions, options);

                expect(loadCoreSdkScript).toHaveBeenCalledWith(options);

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
            await withConsoleSpy("warn", async (spy) => {
                const mockInstance = {
                    ...createMockSdkInstance(),
                    findEligibleMethods: jest
                        .fn()
                        .mockRejectedValue(new Error("Eligibility failed")),
                };

                (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                    createInstance: jest.fn().mockResolvedValue(mockInstance),
                });

                const { state } = renderProvider();

                await waitFor(() => expectResolvedState(state));

                await waitFor(() =>
                    expect(spy).toHaveBeenCalledWith(
                        "Failed to get eligible payment methods:",
                        expect.any(Error),
                    ),
                );

                expect(state.eligiblePaymentMethods).toBe(null);
            });
        });
    });

    describe("Props Changes", () => {
        test("should reset state when createInstanceOptions change", async () => {
            const { state, TestComponent } = setupTestComponent();

            const { rerender } = render(
                <PayPalProvider
                    components={createInstanceOptions.components}
                    clientToken={createInstanceOptions.clientToken}
                    scriptOptions={scriptOptions}
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
                    scriptOptions={scriptOptions}
                >
                    <TestComponent />
                </PayPalProvider>,
            );

            // Should reset to pending state
            expectResetState(state);

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
                scriptOptions={scriptOptions}
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
                scriptOptions={{ environment: "sandbox" }}
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

    test("should reload SDK when actual values change", async () => {
        const { state, TestComponent } = setupTestComponent();

        const { rerender } = render(
            <PayPalProvider
                components={createInstanceOptions.components}
                clientToken={createInstanceOptions.clientToken}
                scriptOptions={scriptOptions}
            >
                <TestComponent />
            </PayPalProvider>,
        );

        await waitFor(() => expectResolvedState(state));

        const loadCallCount = (loadCoreSdkScript as jest.Mock).mock.calls
            .length;

        // Rerender with different client token
        rerender(
            <PayPalProvider
                components={["paypal-payments"]}
                clientToken="NEW-TOKEN"
                scriptOptions={scriptOptions}
            >
                <TestComponent />
            </PayPalProvider>,
        );

        // Should reset to pending state
        expectResetState(state);

        // Should reload with new token
        await waitFor(() =>
            expect((loadCoreSdkScript as jest.Mock).mock.calls.length).toBe(
                loadCallCount + 1,
            ),
        );
    });

    test("should reload SDK when scriptOptions change", async () => {
        const { state, TestComponent } = setupTestComponent();

        const { rerender } = render(
            <PayPalProvider
                components={createInstanceOptions.components}
                clientToken={createInstanceOptions.clientToken}
                scriptOptions={scriptOptions}
            >
                <TestComponent />
            </PayPalProvider>,
        );

        await waitFor(() => expectResolvedState(state));

        const loadCallCount = (loadCoreSdkScript as jest.Mock).mock.calls
            .length;

        // Rerender with different environment
        rerender(
            <PayPalProvider
                components={createInstanceOptions.components}
                clientToken={createInstanceOptions.clientToken}
                scriptOptions={{ environment: "production" }}
            >
                <TestComponent />
            </PayPalProvider>,
        );

        // Should reset to pending state
        expectResetState(state);

        // Should reload with new environment
        await waitFor(() =>
            expect((loadCoreSdkScript as jest.Mock).mock.calls.length).toBe(
                loadCallCount + 1,
            ),
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
                scriptOptions={scriptOptions}
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
                scriptOptions={{ environment: "sandbox" }}
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

describe("usePayPal", () => {
    test("should throw an error when used without PayPalProvider", () => {
        withConsoleSpy("error", () => {
            const { TestComponent } = setupTestComponent();

            expect(() => render(<TestComponent />)).toThrow(
                "usePayPal must be used within a PayPalProvider",
            );
        });
    });
});

function setupTestComponent() {
    const state: PayPalContextState = {
        loadingStatus: INSTANCE_LOADING_STATE.INITIAL,
        sdkInstance: null,
        eligiblePaymentMethods: null,
        error: null,
        dispatch: jest.fn(),
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
