import React from "react";
import { render, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";
import { loadScript } from "@paypal/paypal-js";

import { PayPalScriptProvider } from "../PayPalScriptProvider";
import { PayPalHostedFieldsProvider } from "./PayPalHostedFieldsProvider";
import { PayPalHostedField } from "./PayPalHostedField";
import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types/enums";

const onError = jest.fn();
const wrapper = ({ children }) => (
    <ErrorBoundary fallback={<div>Error</div>} onError={onError}>
        {children}
    </ErrorBoundary>
);

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

describe("PayPalHostedFieldsProvider", () => {
    const isEligible = jest.fn();

    beforeEach(() => {
        document.body.innerHTML = "";

        window.paypal = {
            HostedFields: {
                isEligible: isEligible.mockReturnValue(true),
                render: jest.fn().mockResolvedValue({
                    teardown: jest.fn(),
                }),
            },
        };

        loadScript.mockResolvedValue(window.paypal);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should throw an Error using the component without the PayPalScriptProvider", () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        render(<PayPalHostedFieldsProvider />, { wrapper });
        expect(onError.mock.calls[0][0].message).toEqual(
            "usePayPalScriptReducer must be used within a PayPalScriptProvider"
        );
        spyConsoleError.mockRestore();
    });

    test("should throw an Error using the component with PayPalScriptProvider without data-client-token", () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        render(
            <PayPalScriptProvider>
                <PayPalHostedFieldsProvider />
            </PayPalScriptProvider>,
            { wrapper }
        );
        expect(onError.mock.calls[0][0].message).toEqual(
            "A client token wasn't found in the provider parent component"
        );
        spyConsoleError.mockRestore();
    });

    test("should throw an Error using the component without children", () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test-client",
                    currency: "USD",
                    intent: "authorize",
                    components: "hosted-fields",
                    "data-client-token": "test-data-client-token",
                }}
            >
                <PayPalHostedFieldsProvider />
            </PayPalScriptProvider>,
            { wrapper }
        );
        expect(onError.mock.calls[0][0].message).toEqual(
            "To use HostedFields you must use it with at least 3 children with types: [number, cvv, expirationDate] includes"
        );
        spyConsoleError.mockRestore();
    });

    test("should throw an Error about missing HostedFields in paypal SDK because hosted-fields isn't imported in components", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        window.paypal = {};

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test-client",
                    currency: "USD",
                    intent: "authorize",
                    "data-client-token": "test-data-client-token",
                }}
            >
                <PayPalHostedFieldsProvider>
                    <PayPalHostedField
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                        options={{ selector: "number" }}
                    />
                    <PayPalHostedField
                        hostedFieldType={
                            PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE
                        }
                        options={{ selector: "expiration" }}
                    />
                    <PayPalHostedField
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                        options={{ selector: "cvv" }}
                    />
                </PayPalHostedFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => {
            expect(onError.mock.calls[0][0].message).toEqual(
                "Unable to render <PayPalHostedFieldsProvider /> because window.paypal.HostedFields is undefined." +
                    "\nTo fix the issue, add 'hosted-fields' to the list of components passed to the parent PayPalScriptProvider: " +
                    "<PayPalScriptProvider options={{ components: 'hosted-fields'}}>"
            );
        });
        spyConsoleError.mockRestore();
    });

    test("should return immediately when script provider is rejected", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        loadScript.mockRejectedValue(new Error("Unknown error"));

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test-client",
                    currency: "USD",
                    intent: "authorize",
                    components: "hosted-fields",
                    "data-client-token": "test-data-client-token",
                }}
            >
                <PayPalHostedFieldsProvider>
                    <PayPalHostedField
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                        options={{ selector: "number" }}
                    />
                    <PayPalHostedField
                        hostedFieldType={
                            PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE
                        }
                        options={{ selector: "expiration" }}
                    />
                    <PayPalHostedField
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                        options={{ selector: "cvv" }}
                    />
                </PayPalHostedFieldsProvider>
            </PayPalScriptProvider>
        );
        await waitFor(() => {
            expect(loadScript).toBeCalled();
        });
        spyConsoleError.mockRestore();
    });

    test("should remove hostedfields components when unilegible", async () => {
        isEligible.mockReturnValue(false);

        const { container } = render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test-client",
                    currency: "USD",
                    intent: "authorize",
                    components: "hosted-fields",
                    "data-client-token": "test-data-client-token",
                }}
            >
                <PayPalHostedFieldsProvider>
                    <PayPalHostedField
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                        options={{ selector: "number" }}
                    />
                    <PayPalHostedField
                        hostedFieldType={
                            PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE
                        }
                        options={{ selector: "expiration" }}
                    />
                    <PayPalHostedField
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                        options={{ selector: "cvv" }}
                    />
                </PayPalHostedFieldsProvider>
            </PayPalScriptProvider>
        );
        await waitFor(() => {
            expect(container.querySelector(".number")).toEqual(null);
        });
        expect(container.querySelector(".expiration")).toEqual(null);
        expect(container.querySelector(".cvv")).toEqual(null);
    });

    test("should throw an Error on hosted fields render process exception", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        window.paypal.HostedFields.render = jest
            .fn()
            .mockRejectedValue(new Error("Failing rendering hostedFields"));

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test-client",
                    currency: "USD",
                    intent: "authorize",
                    "data-client-token": "test-data-client-token",
                }}
            >
                <PayPalHostedFieldsProvider>
                    <PayPalHostedField
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                        options={{ selector: "number" }}
                    />
                    <PayPalHostedField
                        hostedFieldType={
                            PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE
                        }
                        options={{ selector: "expiration" }}
                    />
                    <PayPalHostedField
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                        options={{ selector: "cvv" }}
                    />
                </PayPalHostedFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => {
            expect(onError.mock.calls[0][0].message).toEqual(
                "Failed to render <PayPalHostedFieldsProvider /> component. Error: Failing rendering hostedFields"
            );
        });
        spyConsoleError.mockRestore();
    });

    test("should render hosted fields", async () => {
        const { container, rerender } = render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test-client",
                    currency: "USD",
                    intent: "authorize",
                    "data-client-token": "test-data-client-token",
                    components: "hosted-fields",
                }}
            >
                <PayPalHostedFieldsProvider>
                    <PayPalHostedField
                        className="number"
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                        options={{ selector: ".number" }}
                    />
                    <PayPalHostedField
                        className="expiration"
                        hostedFieldType={
                            PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE
                        }
                        options={{ selector: ".expiration" }}
                    />
                    <PayPalHostedField
                        className="cvv"
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                        options={{ selector: ".cvv" }}
                    />
                </PayPalHostedFieldsProvider>
            </PayPalScriptProvider>
        );

        await waitFor(() => {
            expect(window.paypal.HostedFields.render).toBeCalled();
        });
        expect(
            container.querySelector(".number") instanceof HTMLDivElement
        ).toBeTruthy();
        expect(
            container.querySelector(".expiration") instanceof HTMLDivElement
        ).toBeTruthy();
        expect(container.querySelector(".cvv")).toBeTruthy();

        // Rerender the component with new styles props
        // Shouldn't change the hostedFields refs when rerendering
        rerender(
            <PayPalScriptProvider
                options={{
                    "client-id": "test-client",
                    currency: "USD",
                    intent: "authorize",
                    "data-client-token": "test-data-client-token",
                }}
            >
                <PayPalHostedFieldsProvider
                    styles={{
                        ".valid": { color: "#28a745" },
                        ".invalid": { color: "#dc3545" },
                    }}
                >
                    <PayPalHostedField
                        className="number"
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                        options={{ selector: ".number" }}
                    />
                    <PayPalHostedField
                        className="expiration"
                        hostedFieldType={
                            PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE
                        }
                        options={{ selector: ".expiration" }}
                    />
                    <PayPalHostedField
                        className="cvv"
                        hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                        options={{ selector: ".cvv" }}
                    />
                </PayPalHostedFieldsProvider>
            </PayPalScriptProvider>
        );
        await waitFor(() => {
            expect(window.paypal.HostedFields.render).toBeCalledTimes(2);
        });
    });
});
