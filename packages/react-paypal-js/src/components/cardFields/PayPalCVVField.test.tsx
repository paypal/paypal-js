import React from "react";
import { render, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";
import { loadScript } from "@paypal/paypal-js";
import { mock } from "jest-mock-extended";

import { PayPalCVVField } from "./PayPalCVVField";
import { PayPalScriptProvider } from "../PayPalScriptProvider";
import { PayPalCardFieldsProvider } from "./PayPalCardFieldsProvider";
import { CARD_FIELDS_CONTEXT_ERROR } from "../../constants";

import type { PayPalCardFieldsComponent } from "../../types";
import type { ReactNode } from "react";

const onError = jest.fn();
const CVVField = jest.fn();
const CardFields = jest.fn(
    () =>
        ({
            isEligible: jest.fn().mockReturnValue(true),
            CVVField: CVVField.mockReturnValue({
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

describe("PayPalCVVField", () => {
    beforeEach(() => {
        document.body.innerHTML = "";

        window.paypal = {
            CardFields,
            version: "",
        };

        (loadScript as jest.Mock).mockResolvedValue(window.paypal);
    });
    test("should render component with specific style", async () => {
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
                    <PayPalCVVField style={{ input: { color: "black" } }} />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );
        await waitFor(() => expect(onError).toHaveBeenCalledTimes(0));

        expect(CVVField).toHaveBeenCalledWith(
            expect.objectContaining({ style: { input: { color: "black" } } })
        );

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
                    dataClientToken: "test-data-client-token",
                }}
            >
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <PayPalCVVField
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

        expect(CVVField).toHaveBeenCalledWith(
            expect.objectContaining({
                inputEvents: {
                    onChange: mockOnChange,
                    onFocus: mockOnFocus,
                    onBlur: mockOnBlur,
                    onInputSubmitRequest: mockOnInputSubmitRequest,
                },
            })
        );

        spyConsoleError.mockRestore();
    });

    test("should render component with a specific placeholder", async () => {
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
                    <PayPalCVVField placeholder="custom-place-holder" />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );
        await waitFor(() => expect(onError).toHaveBeenCalledTimes(0));

        expect(CVVField).toHaveBeenCalledWith(
            expect.objectContaining({
                placeholder: "custom-place-holder",
            })
        );

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
                    <PayPalCVVField className="class1 class2 class3" />
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
                <PayPalCVVField />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toBeCalledTimes(1));
        expect(onError.mock.calls[0][0].message).toBe(
            CARD_FIELDS_CONTEXT_ERROR
        );
        spyConsoleError.mockRestore();
    });
});
