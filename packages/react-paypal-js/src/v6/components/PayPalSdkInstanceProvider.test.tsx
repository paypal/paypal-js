import "@testing-library/jest-dom";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import { PayPalSdkInstanceProvider } from "./PayPalSdkInstanceProvider";
import { usePayPalInstance } from "../hooks/usePayPalInstance";
import { INSTANCE_LOADING_STATE } from "../types/InstanceProviderTypes";
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
    InstanceContextState,
} from "../types";

jest.mock("@paypal/paypal-js/sdk-v6", () => ({
    loadCoreSdkScript: jest.fn(),
}));

jest.mock("../utils", () => ({
    ...jest.requireActual("../utils"),
    isServer: false,
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
        <PayPalSdkInstanceProvider
            createInstanceOptions={instanceOptions}
            scriptOptions={scriptOpts}
        >
            <TestComponent>{children}</TestComponent>
        </PayPalSdkInstanceProvider>,
    );

    return { ...result, state };
}

describe("PayPalSdkInstanceProvider", () => {
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

            const updatedOptions = {
                ...createInstanceOptions,
                clientToken: "new-client-token",
            };

            const { rerender } = render(
                <PayPalSdkInstanceProvider
                    createInstanceOptions={createInstanceOptions}
                    scriptOptions={scriptOptions}
                >
                    <TestComponent />
                </PayPalSdkInstanceProvider>,
            );

            // Wait for initial load
            await waitFor(() => expectResolvedState(state));

            // Change the options
            rerender(
                <PayPalSdkInstanceProvider
                    createInstanceOptions={updatedOptions}
                    scriptOptions={scriptOptions}
                >
                    <TestComponent />
                </PayPalSdkInstanceProvider>,
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
            <PayPalSdkInstanceProvider
                createInstanceOptions={createInstanceOptions}
                scriptOptions={scriptOptions}
            >
                <TestComponent />
            </PayPalSdkInstanceProvider>,
        );

        await waitFor(() => expectResolvedState(state));

        const loadCallCount = (loadCoreSdkScript as jest.Mock).mock.calls
            .length;

        // Rerender with new object reference but same values
        rerender(
            <PayPalSdkInstanceProvider
                createInstanceOptions={{
                    components: ["paypal-payments"],
                    clientToken: TEST_CLIENT_TOKEN,
                }}
                scriptOptions={{ environment: "sandbox" }}
            >
                <TestComponent />
            </PayPalSdkInstanceProvider>,
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
            <PayPalSdkInstanceProvider
                createInstanceOptions={createInstanceOptions}
                scriptOptions={scriptOptions}
            >
                <TestComponent />
            </PayPalSdkInstanceProvider>,
        );

        await waitFor(() => expectResolvedState(state));

        const loadCallCount = (loadCoreSdkScript as jest.Mock).mock.calls
            .length;

        // Rerender with different client token
        rerender(
            <PayPalSdkInstanceProvider
                createInstanceOptions={{
                    components: ["paypal-payments"],
                    clientToken: "NEW-TOKEN",
                }}
                scriptOptions={scriptOptions}
            >
                <TestComponent />
            </PayPalSdkInstanceProvider>,
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
            <PayPalSdkInstanceProvider
                createInstanceOptions={createInstanceOptions}
                scriptOptions={scriptOptions}
            >
                <TestComponent />
            </PayPalSdkInstanceProvider>,
        );

        await waitFor(() => expectResolvedState(state));

        const loadCallCount = (loadCoreSdkScript as jest.Mock).mock.calls
            .length;

        // Rerender with different environment
        rerender(
            <PayPalSdkInstanceProvider
                createInstanceOptions={createInstanceOptions}
                scriptOptions={{ environment: "production" }}
            >
                <TestComponent />
            </PayPalSdkInstanceProvider>,
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
            <PayPalSdkInstanceProvider
                createInstanceOptions={complexOptions}
                scriptOptions={scriptOptions}
            >
                <TestComponent />
            </PayPalSdkInstanceProvider>,
        );

        await waitFor(() => expectResolvedState(state));

        const loadCallCount = (loadCoreSdkScript as jest.Mock).mock.calls
            .length;

        // Rerender with same values but new object reference
        rerender(
            <PayPalSdkInstanceProvider
                createInstanceOptions={{
                    components: ["paypal-payments", "venmo-payments"],
                    clientToken: TEST_CLIENT_TOKEN,
                    locale: "en_US",
                }}
                scriptOptions={{ environment: "sandbox" }}
            >
                <TestComponent />
            </PayPalSdkInstanceProvider>,
        );

        // Wait a bit to ensure no reload happens
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Should NOT reload
        expect((loadCoreSdkScript as jest.Mock).mock.calls.length).toBe(
            loadCallCount,
        );
    });
});

describe("usePayPalInstance", () => {
    test("should throw an error when used without PayPalSdkInstanceProvider", () => {
        withConsoleSpy("error", () => {
            const { TestComponent } = setupTestComponent();

            expect(() => render(<TestComponent />)).toThrow(
                "usePayPalInstance must be used within a PayPalInstanceProvider",
            );
        });
    });
});

function setupTestComponent() {
    const state: InstanceContextState = {
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
        const instanceState = usePayPalInstance();
        Object.assign(state, instanceState);
        return <>{children}</>;
    }

    return {
        state,
        TestComponent,
    };
}
