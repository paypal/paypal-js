import React from "react";
import { render, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";
import { loadScript } from "@paypal/paypal-js";
import { mock } from "jest-mock-extended";

import { PayPalScriptProvider } from "../PayPalScriptProvider";
import { PayPalCardFieldsProvider } from "./PayPalCardFieldsProvider";
import { CARD_FIELDS_CONTEXT_ERROR } from "../../constants";
import { PayPalCardFieldsForm } from "./PayPalCardFieldsForm";

import type { PayPalCardFieldsComponent } from "../../types";
import type { ReactNode } from "react";

const onError = jest.fn();
const CVVField = jest.fn();
const ExpiryField = jest.fn();
const NumberField = jest.fn();
const NameField = jest.fn();
const CardFields = jest.fn(
    () =>
        ({
            isEligible: jest.fn().mockReturnValue(true),
            CVVField: CVVField.mockReturnValue({
                render: jest.fn(() => Promise.resolve()),
                close: jest.fn(() => Promise.resolve()),
            }),
            ExpiryField: ExpiryField.mockReturnValue({
                render: jest.fn(() => Promise.resolve()),
                close: jest.fn(() => Promise.resolve()),
            }),
            NumberField: NumberField.mockReturnValue({
                render: jest.fn(() => Promise.resolve()),
                close: jest.fn(() => Promise.resolve()),
            }),
            NameField: NameField.mockReturnValue({
                render: jest.fn(() => Promise.resolve()),
                close: jest.fn(() => Promise.resolve()),
            }),
        } as unknown as PayPalCardFieldsComponent)
);
const wrapper = ({ children }: { children: ReactNode }) => (
    <ErrorBoundary fallback={<div>Error</div>} onError={onError}>
        {children}
    </ErrorBoundary>
);

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));
const mockCreateOrder = mock<() => Promise<string>>();
const mockOnApprove = mock<() => Promise<string>>();
const mockOnError = mock<() => void>();
const mockOnChange = mock<() => void>();
const mockOnBlur = mock<() => void>();
const mockOnFocus = mock<() => void>();
const mockOnInputSubmitRequest = mock<() => void>();

describe("PayPalCardFieldsForm", () => {
    beforeEach(() => {
        document.body.innerHTML = "";

        window.paypal = {
            CardFields,
            version: "",
        };

        (loadScript as jest.Mock).mockResolvedValue(window.paypal);
    });
    test("should render each component with the global style passed", async () => {
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
                }}
            >
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <PayPalCardFieldsForm
                        style={{ input: { color: "black" } }}
                    />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );
        await waitFor(() => expect(onError).toHaveBeenCalledTimes(0));

        [CVVField, ExpiryField, NameField, NumberField].forEach((field) => {
            expect(field).toHaveBeenCalledWith(
                expect.objectContaining({
                    style: { input: { color: "black" } },
                })
            );
        });

        spyConsoleError.mockRestore();
    });

    test("should render component with specific input event callbacks", async () => {
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
                }}
            >
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <PayPalCardFieldsForm
                        inputEvents={{
                            onChange: mockOnChange,
                            onFocus: mockOnFocus,
                            onBlur: mockOnBlur,
                            onInputSubmitRequest: mockOnInputSubmitRequest,
                        }}
                    />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );
        await waitFor(() => expect(onError).toHaveBeenCalledTimes(0));

        [CVVField, ExpiryField, NameField, NumberField].forEach((field) => {
            expect(field).toHaveBeenCalledWith(
                expect.objectContaining({
                    inputEvents: {
                        onChange: mockOnChange,
                        onFocus: mockOnFocus,
                        onBlur: mockOnBlur,
                        onInputSubmitRequest: mockOnInputSubmitRequest,
                    },
                })
            );
        });

        spyConsoleError.mockRestore();
    });

    test("should render component with specific container classes", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        const { container } = render(
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
                    <PayPalCardFieldsForm className="class1 class2 class3" />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );
        await waitFor(() => expect(onError).toHaveBeenCalledTimes(0));

        const renderedElement = container.querySelector(".class1");
        expect(renderedElement?.classList.contains("class2")).toBeTruthy();
        expect(renderedElement?.classList.contains("class3")).toBeTruthy();

        spyConsoleError.mockRestore();
    });

    test("should fail rendering the component when context is invalid", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        render(
            <PayPalScriptProvider options={{ clientId: "" }}>
                <PayPalCardFieldsForm />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toBeCalledTimes(4)); // 4 times, 1 for each field in the form.
        expect(onError.mock.calls[0][0].message).toBe(
            CARD_FIELDS_CONTEXT_ERROR
        );
        spyConsoleError.mockRestore();
    });
});
