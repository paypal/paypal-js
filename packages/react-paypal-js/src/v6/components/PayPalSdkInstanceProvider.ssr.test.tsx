/**
 * @jest-environment node
 */

import React from "react";
import { renderToString } from "react-dom/server";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import { PayPalSdkInstanceProvider } from "./PayPalSdkInstanceProvider";
import { usePayPalInstance } from "../hooks/usePayPalInstance";
import { INSTANCE_LOADING_STATE } from "../types/InstanceProviderTypes";
import { isServer } from "../utils";

import type {
    CreateInstanceOptions,
    InstanceContextState,
    LoadCoreSdkScriptOptions,
} from "../types";

jest.mock("@paypal/paypal-js/sdk-v6", () => ({
    loadCoreSdkScript: jest.fn(),
}));

jest.mock("../utils", () => ({
    isServer: true,
}));

// Test constants
const TEST_CLIENT_TOKEN = "test-client-token";

const createInstanceOptions: CreateInstanceOptions<["paypal-payments"]> = {
    components: ["paypal-payments"],
    clientToken: TEST_CLIENT_TOKEN,
};

const scriptOptions: LoadCoreSdkScriptOptions = {
    environment: "sandbox",
};

// Test utilities
function renderSSRProvider(
    instanceOptions = createInstanceOptions,
    scriptOpts = scriptOptions,
    children?: React.ReactNode,
) {
    const { state, TestComponent } = setupSSRTestComponent();

    const html = renderToString(
        <PayPalSdkInstanceProvider
            createInstanceOptions={instanceOptions}
            scriptOptions={scriptOpts}
        >
            <TestComponent>{children}</TestComponent>
        </PayPalSdkInstanceProvider>,
    );

    return { html, state };
}

describe("PayPalSdkInstanceProvider SSR", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should verify isServer mock is working", () => {
        expect(isServer).toBe(true);
    });

    test("should initialize correctly and never load scripts during SSR", () => {
        const { state } = renderSSRProvider();

        expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.INITIAL);
        expect(state.sdkInstance).toBe(null);
        expect(state.eligiblePaymentMethods).toBe(null);
        expect(state.error).toBe(null);
        expect(loadCoreSdkScript).not.toHaveBeenCalled();
    });

    describe("Server-Side Rendering", () => {
        test("should not attempt DOM access during server rendering", () => {
            // In Node environment, document should be undefined
            expect(typeof document).toBe("undefined");

            expect(() => renderSSRProvider()).not.toThrow();
        });

        test("should maintain state consistency across multiple server renders", () => {
            const { html: html1, state: state1 } = renderSSRProvider();
            const { html: html2, state: state2 } = renderSSRProvider();

            // Both renders should produce identical state and HTML
            expect(state1.loadingStatus).toBe(state2.loadingStatus);
            expect(state1.loadingStatus).toBe(INSTANCE_LOADING_STATE.INITIAL);
            expect(state1.sdkInstance).toBe(state2.sdkInstance);
            expect(state1.sdkInstance).toBe(null);
            expect(html1).toBe(html2);
        });
    });

    describe("Hydration Preparation", () => {
        test("should prepare serializable state for client hydration", () => {
            const { state } = renderSSRProvider();

            // Server state should be safe for serialization
            const serializedState = JSON.stringify({
                loadingStatus: state.loadingStatus,
                sdkInstance: state.sdkInstance,
                eligiblePaymentMethods: state.eligiblePaymentMethods,
                error: state.error,
            });

            expect(() => JSON.parse(serializedState)).not.toThrow();

            const parsedState = JSON.parse(serializedState);
            expect(parsedState.loadingStatus).toBe(
                INSTANCE_LOADING_STATE.INITIAL,
            );
            expect(parsedState.sdkInstance).toBe(null);
            expect(parsedState.eligiblePaymentMethods).toBe(null);
            expect(parsedState.error).toBe(null);
        });

        test("should handle different options consistently", () => {
            const updatedOptions = {
                ...createInstanceOptions,
                clientToken: "updated-token",
            };

            const { state: state1 } = renderSSRProvider();
            const { state: state2 } = renderSSRProvider(updatedOptions);

            // Both should have consistent initial state regardless of options
            expect(state1.loadingStatus).toBe(INSTANCE_LOADING_STATE.INITIAL);
            expect(state2.loadingStatus).toBe(INSTANCE_LOADING_STATE.INITIAL);
            expect(loadCoreSdkScript).not.toHaveBeenCalled();
        });
    });

    describe("React SSR Integration", () => {
        test("should render without warnings or errors", () => {
            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation();

            const { html } = renderSSRProvider(
                createInstanceOptions,
                scriptOptions,
                <div>SSR Content</div>,
            );

            expect(consoleSpy).not.toHaveBeenCalled();
            expect(html).toBeTruthy();
            expect(typeof html).toBe("string");
            expect(html).toContain("SSR Content");

            consoleSpy.mockRestore();
        });

        test("should handle complex options without serialization issues", () => {
            const complexOptions: CreateInstanceOptions<
                ["paypal-payments", "venmo-payments"]
            > = {
                components: ["paypal-payments", "venmo-payments"],
                clientToken: "complex-token-123",
                locale: "en_US",
                pageType: "checkout",
                partnerAttributionId: "test-partner",
            };

            const { html } = renderSSRProvider(
                complexOptions,
                { environment: "production", debug: true },
                <div>Complex Options Test</div>,
            );

            expect(html).toBeTruthy();
            expect(html).toContain("Complex Options Test");
            expect(() => JSON.stringify(complexOptions)).not.toThrow();
        });

        test("should generate consistent HTML across renders", () => {
            const { html: html1 } = renderSSRProvider(
                createInstanceOptions,
                scriptOptions,
                <div data-testid="ssr-content">Test Content</div>,
            );
            const { html: html2 } = renderSSRProvider(
                createInstanceOptions,
                scriptOptions,
                <div data-testid="ssr-content">Test Content</div>,
            );

            expect(html1).toBe(html2);
            expect(html1).toContain('data-testid="ssr-content"');
        });
    });

    describe("Multiple Renders", () => {
        test("should handle multiple renders without side effects", () => {
            // Multiple renders should not cause issues
            expect(() => {
                for (let i = 0; i < 5; i++) {
                    renderSSRProvider({
                        ...createInstanceOptions,
                        clientToken: `token-${i}`,
                    });
                }
            }).not.toThrow();

            // Should never attempt to load scripts regardless of render count
            expect(loadCoreSdkScript).not.toHaveBeenCalled();
        });
    });
});

describe("usePayPalInstance SSR", () => {
    test("should work correctly in SSR context", () => {
        const { state } = renderSSRProvider();

        expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.INITIAL);
    });
});

function setupSSRTestComponent() {
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
        try {
            const instanceState = usePayPalInstance();
            Object.assign(state, instanceState);
        } catch (error) {
            state.error = error as Error;
        }
        return <>{children}</>;
    }

    return {
        state,
        TestComponent,
    };
}
