import React from "react";
import { render, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";
import { loadScript } from "@paypal/paypal-js";
import { mock } from "jest-mock-extended";
import { PayPalCardFieldsComponent } from "@paypal/paypal-js/types/components/card-fields";

import { PayPalScriptProvider } from "../PayPalScriptProvider";
import { PayPalCardFieldsProvider } from "./PayPalCardFieldsProvider";
import {
    CARD_FIELDS_DUPLICATE_CHILDREN_ERROR,
    EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE,
} from "../../constants";
import { PayPalNumberField } from "./PayPalNumberField";
import { PayPalCVVField } from "./PayPalCVVField";
import { PayPalExpiryField } from "./PayPalExpiryField";
import { zoidCardFieldsComponents } from "./utils";

import type { ReactNode } from "react";

const mockCreateOrder = mock<() => Promise<string>>();
const mockOnApprove = mock<() => Promise<string>>();
const mockOnError = mock<() => void>();
const onError = jest.fn();
const wrapper = ({ children }: { children: ReactNode }) => (
    <ErrorBoundary fallback={<div>Error</div>} onError={onError}>
        {children}
    </ErrorBoundary>
);

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

describe("PayPalCardFieldsProvider", () => {
    const isEligible = jest.fn();
    const mockRender = jest.fn();

    const componentMethods = {
        render: mockRender.mockResolvedValue({
            catch: jest.fn(),
        }),
        close: jest.fn().mockResolvedValue({
            catch: jest.fn(),
        }),
    };

    beforeEach(() => {
        document.body.innerHTML = "";

        window.paypal = {
            CardFields: () => {
                return {
                    isEligible: () => isEligible.mockReturnValue(true),
                    NumberField: () => componentMethods,
                    NameField: () => componentMethods,
                    CVVField: () => componentMethods,
                    ExpiryField: () => componentMethods,
                } as unknown as PayPalCardFieldsComponent;
            },
            version: "",
        };

        (loadScript as jest.Mock).mockResolvedValue(window.paypal);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // PASS
    test("should throw an Error using the component without the PayPalScriptProvider", () => {
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
        expect(onError.mock.calls[0][0].message).toEqual(
            "usePayPalScriptReducer must be used within a PayPalScriptProvider"
        );
        spyConsoleError.mockRestore();
    });

    // PASS
    test("should throw an Error using the component with PayPalScriptProvider without dataClientToken", () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        render(
            <PayPalScriptProvider options={{ clientId: "" }}>
                <PayPalCardFieldsProvider
                    onApprove={mockOnApprove}
                    createOrder={mockCreateOrder}
                    onError={mockOnError}
                >
                    <></>
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );
        expect(onError.mock.calls[0][0].message).toEqual(
            EMPTY_BRAINTREE_AUTHORIZATION_ERROR_MESSAGE
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
        await waitFor(() => {
            expect(onError.mock.calls[0][0].message).toEqual(
                CARD_FIELDS_DUPLICATE_CHILDREN_ERROR
            );
        });
        spyConsoleError.mockRestore();
    });

    // test("should return immediately when script provider is rejected", async () => {
    //     const spyConsoleError = jest
    //         .spyOn(console, "error")
    //         .mockImplementation();
    //     (loadScript as jest.Mock).mockRejectedValue(new Error("Unknown error"));

    //     render(
    //         <PayPalScriptProvider
    //             options={{
    //                 clientId: "test-client",
    //                 currency: "USD",
    //                 intent: "authorize",
    //                 components: "card-fields",
    //                 dataClientToken: "test-data-client-token",
    //             }}
    //         >
    //             <PayPalCardFieldsProvider
    //                 onApprove={mockOnApprove}
    //                 createOrder={mockCreateOrder}
    //                 onError={mockOnError}
    //             >
    //                 <PayPalNumberField />
    //                 <PayPalCVVField />
    //                 <PayPalExpiryField />
    //             </PayPalCardFieldsProvider>
    //         </PayPalScriptProvider>
    //     );
    //     await waitFor(() => {
    //         expect(loadScript).toBeCalled();
    //     });
    //     spyConsoleError.mockRestore();
    // });

    test.only("should not render CardFields components when unilegible", async () => {
        isEligible.mockReturnValue(false);

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
            expect(zoidCardFieldsComponents("number").length).toEqual(0);
            expect(zoidCardFieldsComponents("expiry").length).toEqual(0);
            expect(zoidCardFieldsComponents("cvv").length).toEqual(0);
        });
    });

    test("should throw an Error on hosted fields render process exception", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();

        mockRender.mockReturnValue({
            catch: jest.fn().mockRejectedValue(new Error("fail")),
        });

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
                    <PayPalCVVField />
                    <PayPalExpiryField />
                </PayPalCardFieldsProvider>
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => {
            expect(onError.mock.calls[0][0].message).toEqual(
                "Failed to render <PayPalCardFieldsProvider /> component. Error: Failing rendering CardFields"
            );
        });
        spyConsoleError.mockRestore();
    });

    // test("should render card fields", async () => {
    //     const { container, rerender } = render(
    //         <PayPalScriptProvider
    //             options={{
    //                 clientId: "test-client",
    //                 currency: "USD",
    //                 intent: "authorize",
    //                 dataClientToken: "test-data-client-token",
    //                 components: "card-fields",
    //             }}
    //         >
    //             <PayPalCardFieldsProvider createOrder={mockCreateOrder}>
    //                 <PayPalNumberField />
    //                 <PayPalCVVField />
    //                 <PayPalExpiryField />
    //             </PayPalCardFieldsProvider>
    //         </PayPalScriptProvider>
    //     );

    //     await waitFor(() => {
    //         expect(
    //             window?.paypal?.CardFields?.().NumberField()?.render
    //         ).toBeCalled();
    //     });
    //     expect(
    //         container.querySelector(".number") instanceof HTMLDivElement
    //     ).toBeTruthy();
    //     expect(
    //         container.querySelector(".expiration") instanceof HTMLDivElement
    //     ).toBeTruthy();
    //     expect(container.querySelector(".cvv")).toBeTruthy();

    //     // Rerender the component with new styles props
    //     // Shouldn't change the CardFields refs when rerendering
    //     rerender(
    //         <PayPalScriptProvider
    //             options={{
    //                 clientId: "test-client",
    //                 currency: "USD",
    //                 intent: "authorize",
    //                 dataClientToken: "test-data-client-token",
    //             }}
    //         >
    //             <PayPalCardFieldsProvider
    //                 createOrder={mockCreateOrder}
    //                 // styles={{
    //                 //     ".valid": { color: "#28a745" },
    //                 //     ".invalid": { color: "#dc3545" },
    //                 // }}
    //             >
    //                 <PayPalNumberField />
    //                 <PayPalCVVField />
    //                 <PayPalExpiryField />
    //             </PayPalCardFieldsProvider>
    //         </PayPalScriptProvider>
    //     );
    //     await waitFor(() => {
    //         expect(window?.paypal?.CardFields?.render).toBeCalledTimes(2);
    //     });
    // });
    // test("should not set context state if component is unmounted", async () => {
    //     jest.useFakeTimers();

    //     (
    //         (window.paypal as PayPalNamespace)
    //             .CardFields as PayPalCardFieldsComponent
    //     ).render = jest
    //         .fn()
    //         .mockImplementation(
    //             () =>
    //                 new Promise((resolve) => setTimeout(() => resolve({}), 500))
    //         );

    //     const { container, unmount } = render(
    //         <PayPalScriptProvider
    //             options={{
    //                 clientId: "test-client",
    //                 currency: "USD",
    //                 intent: "authorize",
    //                 dataClientToken: "test-data-client-token",
    //                 components: "card-fields",
    //             }}
    //         >
    //             <PayPalCardFieldsProvider createOrder={mockCreateOrder}>
    //                 <PayPalNumberField />
    //                 <PayPalCVVField />
    //                 <PayPalExpiryField />
    //             </PayPalCardFieldsProvider>
    //         </PayPalScriptProvider>
    //     );

    //     await waitFor(() => {
    //         expect(window?.paypal?.CardFields?.render).toBeCalled();
    //     });
    //     unmount();
    //     jest.runAllTimers();

    //     expect(
    //         container.querySelector(".number") instanceof HTMLDivElement
    //     ).toBeFalsy();
    //     jest.useRealTimers();
    // });
});
