import React, { type ReactNode } from "react";
import { render, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";
import { loadScript } from "@paypal/paypal-js";
import { mock } from "jest-mock-extended";

import { PayPalScriptProvider } from "../PayPalScriptProvider";
import { PayPalHostedFieldsProvider } from "./PayPalHostedFieldsProvider";
import { PayPalHostedField } from "./PayPalHostedField";
import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types/enums";
import { EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE } from "../../constants";

import type {
    PayPalNamespace,
    PayPalHostedFieldsComponent,
} from "@paypal/paypal-js";

const mockCreateOrder = mock<() => Promise<string>>();
const onError = jest.fn();
const wrapper = ({ children }: { children: ReactNode }) => (
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
            version: "",
        };

        (loadScript as jest.Mock).mockResolvedValue(window.paypal);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should throw an Error using the component without the PayPalScriptProvider", () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        render(
            <PayPalHostedFieldsProvider createOrder={mockCreateOrder}>
                <></>
            </PayPalHostedFieldsProvider>,
            { wrapper }
        );
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
            <PayPalScriptProvider options={{ "client-id": "" }}>
                <PayPalHostedFieldsProvider createOrder={mockCreateOrder}>
                    <></>
                </PayPalHostedFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );
        expect(onError.mock.calls[0][0].message).toEqual(
            EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE
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
                <PayPalHostedFieldsProvider createOrder={mockCreateOrder}>
                    <></>
                </PayPalHostedFieldsProvider>
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
        window.paypal = { version: "" };

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test-client",
                    currency: "USD",
                    intent: "authorize",
                    "data-client-token": "test-data-client-token",
                }}
            >
                <PayPalHostedFieldsProvider createOrder={mockCreateOrder}>
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
        (loadScript as jest.Mock).mockRejectedValue(new Error("Unknown error"));

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
                <PayPalHostedFieldsProvider createOrder={mockCreateOrder}>
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
                <PayPalHostedFieldsProvider createOrder={mockCreateOrder}>
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
        (
            (window.paypal as PayPalNamespace)
                .HostedFields as PayPalHostedFieldsComponent
        ).render = jest
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
                <PayPalHostedFieldsProvider createOrder={mockCreateOrder}>
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
                <PayPalHostedFieldsProvider createOrder={mockCreateOrder}>
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
            expect(window?.paypal?.HostedFields?.render).toBeCalled();
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
                    createOrder={mockCreateOrder}
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
            expect(window?.paypal?.HostedFields?.render).toBeCalledTimes(2);
        });
    });
    test("should not set context state if component is unmounted", async () => {
        jest.useFakeTimers();

        (
            (window.paypal as PayPalNamespace)
                .HostedFields as PayPalHostedFieldsComponent
        ).render = jest
            .fn()
            .mockImplementation(
                () =>
                    new Promise((resolve) => setTimeout(() => resolve({}), 500))
            );

        const { container, unmount } = render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test-client",
                    currency: "USD",
                    intent: "authorize",
                    "data-client-token": "test-data-client-token",
                    components: "hosted-fields",
                }}
            >
                <PayPalHostedFieldsProvider createOrder={mockCreateOrder}>
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
            expect(window?.paypal?.HostedFields?.render).toBeCalled();
        });
        unmount();
        jest.runAllTimers();

        expect(
            container.querySelector(".number") instanceof HTMLDivElement
        ).toBeFalsy();
        jest.useRealTimers();
    });

    test("should call render function with installments option", async () => {
        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test-client",
                    currency: "USD",
                    intent: "authorize",
                    "data-client-token": "test-data-client-token",
                    components: "hosted-fields",
                }}
            >
                <PayPalHostedFieldsProvider
                    createOrder={jest.fn()}
                    installments={{
                        onInstallmentsRequested: jest.fn(),
                        onInstallmentsAvailable: jest.fn(),
                        onInstallmentsError: jest.fn(),
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
            expect(window?.paypal?.HostedFields?.render).toBeCalledWith(
                expect.objectContaining({
                    installments: {
                        onInstallmentsRequested: expect.any(Function),
                        onInstallmentsAvailable: expect.any(Function),
                        onInstallmentsError: expect.any(Function),
                    },
                })
            );
        });
    });
});
