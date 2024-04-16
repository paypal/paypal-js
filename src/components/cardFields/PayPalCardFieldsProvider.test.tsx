import React from "react";
import { render, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";
import { PayPalNamespace, loadScript } from "@paypal/paypal-js";
import { mock } from "jest-mock-extended";

import { PayPalScriptProvider } from "../PayPalScriptProvider";
import { PayPalCardFieldsProvider } from "./PayPalCardFieldsProvider";
import {
    CARD_FIELDS_DUPLICATE_CHILDREN_ERROR,
} from "../../constants";
import { PayPalNumberField } from "./PayPalNumberField";
import { PayPalCVVField } from "./PayPalCVVField";
import { PayPalExpiryField } from "./PayPalExpiryField";

import type { PayPalCardFieldsComponent } from "@paypal/paypal-js/types/components/card-fields";
import type { ReactNode } from "react";

const MOCK_ELEMENT_ID = "mock-element";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

function getMockElementsRendered() {
    return document.querySelectorAll(`div[id^=${MOCK_ELEMENT_ID}]`);
}

const mockCreateOrder = mock<() => Promise<string>>();
const mockOnApprove = mock<() => Promise<string>>();
const mockOnError = mock<() => void>();
const onError = jest.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
    <ErrorBoundary fallback={<div>Error</div>} onError={onError}>
        {children}
    </ErrorBoundary>
);

const isEligible = jest.fn();

const happyMethods = {
    render: jest.fn((element: string | HTMLElement) => {
        // Simulate adding element
        if (typeof element !== "string") {
            const child = document.createElement("div");
            child.setAttribute("id", MOCK_ELEMENT_ID);
            element.append(child);
        }
        return Promise.resolve();
    }),
    close: jest.fn(() => Promise.resolve()),
};
const unHappyMethods = {
    render: jest.fn((element: string | HTMLElement) => {
        // Simulate adding element
        if (typeof element !== "string") {
            element.append(document.createElement("div"));
        }
        return Promise.reject("Unknown error");
    }),
    close: jest.fn(() => Promise.reject("Unknown error")),
};

describe("PayPalCardFieldsProvider", () => {
    beforeEach(() => {
        document.body.innerHTML = "";

        window.paypal = {
            CardFields: jest.fn(
                () =>
                    ({
                        isEligible: isEligible.mockReturnValue(true),
                        NumberField: jest.fn().mockReturnValue(happyMethods),
                        NameField: jest.fn().mockReturnValue(happyMethods),
                        CVVField: jest.fn().mockReturnValue(happyMethods),
                        ExpiryField: jest.fn().mockReturnValue(happyMethods),
                    } as unknown as PayPalCardFieldsComponent)
            ),
            version: "",
        };

        (loadScript as jest.Mock).mockResolvedValue(window.paypal);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should throw an Error using the component without the PayPalScriptProvider", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        render(
            <PayPalCardFieldsProvider
                onApprove={mockOnApprove}
                createOrder={mockCreateOrder}
                onError={mockOnError}
            >
                <></>
            </PayPalCardFieldsProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toEqual(
            "usePayPalScriptReducer must be used within a PayPalScriptProvider"
        );
        spyConsoleError.mockRestore();
    });

    test("should throw an Error using the component with duplicate fields", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        render(
            <PayPalScriptProvider
                options={{
                    clientId: "test-client",
                    currency: "USD",
                    intent: "authorize",
                    components: "card-fields",
                    dataClientToken: "test-data-client-token",
                }}
            >
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <PayPalNumberField />
                    <PayPalNumberField />
                    <PayPalCVVField />
                    <PayPalExpiryField />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toEqual(
            CARD_FIELDS_DUPLICATE_CHILDREN_ERROR
        );

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
                    clientId: "test-client",
                    currency: "USD",
                    intent: "authorize",
                    components: "card-fields",
                    dataClientToken: "test-data-client-token",
                }}
            >
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <PayPalNumberField />
                    <PayPalCVVField />
                    <PayPalExpiryField />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>
        );
        await waitFor(() => {
            expect(loadScript).toBeCalled();
        });
        expect(getMockElementsRendered().length).toEqual(0);
        expect(onError).toBeCalledTimes(0);

        spyConsoleError.mockRestore();
    });

    test("should not render CardFields components when unilegible", async () => {
        window.paypal = {
            CardFields: jest.fn(
                () =>
                    ({
                        isEligible: jest.fn().mockReturnValue(false),
                    } as unknown as PayPalCardFieldsComponent)
            ),
            version: "",
        };

        render(
            <PayPalScriptProvider
                options={{
                    clientId: "test-client",
                    currency: "USD",
                    intent: "authorize",
                    components: "card-fields",
                    dataClientToken: "test-data-client-token",
                }}
            >
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <PayPalNumberField />
                    <PayPalCVVField />
                    <PayPalExpiryField />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>
        );
        await waitFor(() => {
            expect(getMockElementsRendered().length).toEqual(0);
        });
    });

    test("should catch and throw unexpected zoid render errors", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        window.paypal = {
            CardFields: jest.fn(
                () =>
                    ({
                        isEligible: jest.fn().mockReturnValue(true),
                        NumberField: jest.fn(() => unHappyMethods),
                    } as unknown as PayPalCardFieldsComponent)
            ),
            version: "",
        };

        render(
            <PayPalScriptProvider
                options={{
                    clientId: "test-client",
                    currency: "USD",
                    intent: "authorize",
                    dataClientToken: "test-data-client-token",
                }}
            >
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <PayPalNumberField />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toEqual(
            "Failed to render <PayPalNumberField /> component. Unknown error"
        );
        spyConsoleError.mockRestore();
    });

    test("should throw an error when the 'card-fields' component is missing from the components list passed to the PayPalScriptProvider", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        window.paypal = { CardFields: undefined } as PayPalNamespace;

        render(
            <PayPalScriptProvider
                options={{
                    clientId: "test",
                    components: "buttons,messages",
                }}
            >
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <PayPalNumberField />
                    <PayPalCVVField />
                    <PayPalExpiryField />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });

    test("should render card fields", async () => {
        render(
            <PayPalScriptProvider
                options={{
                    clientId: "test-client",
                    currency: "USD",
                    intent: "authorize",
                    dataClientToken: "test-data-client-token",
                    components: "card-fields",
                }}
            >
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <PayPalNumberField />
                    <PayPalCVVField />
                    <PayPalExpiryField />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>
        );

        await waitFor(() => {
            expect(getMockElementsRendered().length).toEqual(3);
        });
    });

    test("should safely ignore error on render process when paypal buttons container is no longer in the DOM ", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        const mockRender = jest
            .fn()
            .mockRejectedValue(new Error("Unknown error"));
        window.paypal = {
            CardFields: jest.fn(
                () =>
                    ({
                        isEligible: jest.fn().mockReturnValue(true),
                        NumberField: jest.fn(() => ({
                            render: mockRender,
                            close: happyMethods.close,
                        })),
                        CVVField: jest.fn(() => ({
                            render: mockRender,
                            close: happyMethods.close,
                        })),
                        ExpiryField: jest.fn(() => ({
                            render: mockRender,
                            close: happyMethods.close,
                        })),
                    } as unknown as PayPalCardFieldsComponent)
            ),
            version: "",
        };

        render(
            <PayPalScriptProvider
                options={{
                    clientId: "test-client",
                    currency: "USD",
                    intent: "authorize",
                    dataClientToken: "test-data-client-token",
                    components: "card-fields",
                }}
            >
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <PayPalNumberField />
                    <PayPalCVVField />
                    <PayPalExpiryField />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>
        );

        await waitFor(() => expect(mockRender).toHaveBeenCalledTimes(3));
        expect(onError).toBeCalledTimes(0);
        expect(getMockElementsRendered().length).toEqual(0);

        spyConsoleError.mockRestore();
    });
});
