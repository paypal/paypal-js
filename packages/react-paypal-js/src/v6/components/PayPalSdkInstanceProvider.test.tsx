import "@testing-library/jest-dom";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import { PayPalSdkInstanceProvider } from "./PayPalSdkInstanceProvider";
import { usePayPalInstance } from "../hooks/usePayPalInstance";
import { INSTANCE_LOADING_STATE } from "../types/InstanceProviderTypes";

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

// Test constants
const TEST_CLIENT_TOKEN = "test-client-token";
const TEST_ERROR_MESSAGE = "test error";
const TEST_ELIGIBILITY_RESULT = {
    paypal: { eligible: true },
    venmo: { eligible: false },
};

const createInstanceOptions: CreateInstanceOptions<["paypal-payments"]> = {
    components: ["paypal-payments"],
    clientToken: TEST_CLIENT_TOKEN,
};

const scriptOptions: LoadCoreSdkScriptOptions = {
    environment: "sandbox",
};

// Test utilities
function createMockSdkInstance() {
    return {
        findEligibleMethods: jest
            .fn()
            .mockResolvedValue(TEST_ELIGIBILITY_RESULT),
        createPayPalOneTimePaymentSession: jest.fn(),
        updateLocale: jest.fn(),
    };
}

function createMockPayPalNamespace() {
    return {
        createInstance: jest.fn().mockResolvedValue(createMockSdkInstance()),
    };
}

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

            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.PENDING,
                ),
            );
        });

        test("should set loadingStatus to 'resolved' when SDK loads successfully", async () => {
            const { state } = renderProvider();

            expect(loadCoreSdkScript).toHaveBeenCalledWith(scriptOptions);

            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.RESOLVED,
                ),
            );
            expect(state.sdkInstance).toBeTruthy();
            expect(state.error).toBe(null);
        });

        test('should set loadingStatus to "rejected" when SDK fails to load', async () => {
            const spyConsoleError = jest
                .spyOn(console, "error")
                .mockImplementation();

            (loadCoreSdkScript as jest.Mock).mockRejectedValue(
                new Error(TEST_ERROR_MESSAGE),
            );

            const { state } = renderProvider();

            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.REJECTED,
                ),
            );
            expect(state.sdkInstance).toBe(null);
            expect(state.error).toEqual(new Error(TEST_ERROR_MESSAGE));

            spyConsoleError.mockRestore();
        });

        test("should inject script element into document head", async () => {
            // Override mock to actually inject script element for this test
            (loadCoreSdkScript as jest.Mock).mockImplementation(() => {
                const script = document.createElement("script");
                script.src = "https://www.sandbox.paypal.com/web-sdk/v6/core";
                document.head.appendChild(script);
                return Promise.resolve(createMockPayPalNamespace());
            });

            renderProvider();

            await waitFor(() => {
                const scriptElement = document.querySelector(
                    'script[src*="sandbox.paypal.com"]',
                );
                expect(scriptElement).toBeInTheDocument();
            });
        });

        test("should use production URL when environment is production", async () => {
            const productionOptions: LoadCoreSdkScriptOptions = {
                environment: "production",
            };

            // Override mock to inject production script for this test
            (loadCoreSdkScript as jest.Mock).mockImplementation(() => {
                const script = document.createElement("script");
                script.src = "https://www.paypal.com/web-sdk/v6/core";
                document.head.appendChild(script);
                return Promise.resolve(createMockPayPalNamespace());
            });

            renderProvider(createInstanceOptions, productionOptions);

            expect(loadCoreSdkScript).toHaveBeenCalledWith(productionOptions);

            await waitFor(() => {
                const scriptElement = document.querySelector(
                    'script[src*="www.paypal.com"]',
                );
                expect(scriptElement).toBeInTheDocument();
            });
        });
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

            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.RESOLVED,
                ),
            );

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

            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.REJECTED,
                ),
            );

            expect(state.error).toEqual(instanceError);
            expect(state.sdkInstance).toBe(null);
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

            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.RESOLVED,
                ),
            );

            expect(mockCreateInstance).toHaveBeenCalledWith(
                multiComponentOptions,
            );
            expect(state.sdkInstance).toBeTruthy();
        });
    });

    describe("Eligibility Loading", () => {
        test("should load eligible payment methods after instance creation", async () => {
            const { state } = renderProvider();

            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.RESOLVED,
                ),
            );

            await waitFor(() =>
                expect(state.eligiblePaymentMethods).toBeTruthy(),
            );

            expect(state.eligiblePaymentMethods).toEqual(
                TEST_ELIGIBILITY_RESULT,
            );
        });

        test("should handle eligibility loading failure gracefully", async () => {
            const spyConsoleWarn = jest
                .spyOn(console, "warn")
                .mockImplementation();

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

            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.RESOLVED,
                ),
            );

            await waitFor(() =>
                expect(spyConsoleWarn).toHaveBeenCalledWith(
                    "Failed to get eligible payment methods:",
                    expect.any(Error),
                ),
            );

            expect(state.eligiblePaymentMethods).toBe(null);
            expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.RESOLVED);

            spyConsoleWarn.mockRestore();
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
            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.RESOLVED,
                ),
            );
            expect(state.sdkInstance).toBeTruthy();

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
            expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
            expect(state.sdkInstance).toBe(null);
            expect(state.eligiblePaymentMethods).toBe(null);
            expect(state.error).toBe(null);

            // Should reload with new options
            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.RESOLVED,
                ),
            );
        });
    });

    describe("Component Lifecycle", () => {
        test("should not update state after component unmounts during SDK loading", async () => {
            // Make loadCoreSdkScript take longer to resolve
            let resolveLoad: (
                value: ReturnType<typeof createMockPayPalNamespace>,
            ) => void;
            const loadPromise = new Promise<
                ReturnType<typeof createMockPayPalNamespace>
            >((resolve) => {
                resolveLoad = resolve;
            });
            (loadCoreSdkScript as jest.Mock).mockReturnValue(loadPromise);

            const { state, unmount } = renderProvider();

            await waitFor(() =>
                expect(state.loadingStatus).toBe(
                    INSTANCE_LOADING_STATE.PENDING,
                ),
            );

            // Unmount the component
            unmount();

            // Resolve the load after unmounting
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            resolveLoad!(createMockPayPalNamespace());

            // Wait and ensure state wasn't updated
            await waitFor(
                () => {
                    // State should remain in pending since component was unmounted
                    expect(state.loadingStatus).toBe(
                        INSTANCE_LOADING_STATE.PENDING,
                    );
                    expect(state.sdkInstance).toBe(null);
                },
                { timeout: 500 },
            );
        });

        test("should not update state after component unmounts during instance creation", async () => {
            let resolveCreateInstance: (
                value: ReturnType<typeof createMockSdkInstance>,
            ) => void;
            const createInstancePromise = new Promise<
                ReturnType<typeof createMockSdkInstance>
            >((resolve) => {
                resolveCreateInstance = resolve;
            });

            const mockCreateInstance = jest
                .fn()
                .mockReturnValue(createInstancePromise);

            (loadCoreSdkScript as jest.Mock).mockResolvedValue({
                createInstance: mockCreateInstance,
            });

            const { state, unmount } = renderProvider();

            // Wait for SDK to load and createInstance to be called
            await waitFor(() => expect(mockCreateInstance).toHaveBeenCalled());

            // Unmount before instance creation completes
            unmount();

            // Resolve instance creation after unmounting
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            resolveCreateInstance!(createMockSdkInstance());

            // Wait and ensure state wasn't updated
            await waitFor(
                () => {
                    expect(state.loadingStatus).toBe(
                        INSTANCE_LOADING_STATE.PENDING,
                    );
                    expect(state.sdkInstance).toBe(null);
                },
                { timeout: 500 },
            );
        });
    });
});

describe("usePayPalInstance", () => {
    test("should throw an error when used without PayPalSdkInstanceProvider", () => {
        const { TestComponent } = setupTestComponent();
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        expect(() => render(<TestComponent />)).toThrow(
            "usePayPalInstance must be used within a PayPalInstanceProvider",
        );

        spyConsoleError.mockRestore();
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
