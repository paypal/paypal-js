import React, { useState } from "react";
import {
    render,
    waitFor,
    screen,
    fireEvent,
    act,
} from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";

import { PayPalButtons } from "./PayPalButtons";
import { FUNDING } from "@paypal/sdk-constants";
import { loadScript } from "@paypal/paypal-js";
import { PayPalScriptProvider } from "../components/PayPalScriptProvider";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

const onError = jest.fn();
const wrapper = ({ children }) => (
    <ErrorBoundary fallback={<div>Error</div>} onError={onError}>
        {children}
    </ErrorBoundary>
);

describe("<PayPalButtons />", () => {
    beforeEach(() => {
        document.body.innerHTML = "";

        window.paypal = {
            Buttons: jest.fn(() => ({
                close: jest.fn().mockResolvedValue(),
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn().mockResolvedValue({}),
            })),
        };

        loadScript.mockResolvedValue(window.paypal);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should pass props to window.paypal.Buttons()", async () => {
        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons
                    fundingSource={FUNDING.CREDIT}
                    style={{ layout: "horizontal" }}
                />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(window.paypal.Buttons).toHaveBeenCalledWith({
                style: { layout: "horizontal" },
                fundingSource: FUNDING.CREDIT,
                onInit: expect.any(Function),
            })
        );
    });

    test("should use className prop and add to div container", async () => {
        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons className="custom-class-name" />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(document.querySelector("div.custom-class-name")).toBeTruthy()
        );
    });

    test("should disable the Buttons with disabled=true", async () => {
        const onInitCallbackMock = jest.fn();

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons
                    className="custom-class-name"
                    disabled={true}
                    onInit={onInitCallbackMock}
                />
            </PayPalScriptProvider>
        );

        await waitFor(() => {
            expect(
                document.querySelector("div.paypal-buttons-disabled")
            ).toBeTruthy();
        });
        expect(window.paypal.Buttons).toHaveBeenCalled();

        const onInitActions = {
            enable: jest.fn().mockResolvedValue(true),
            disable: jest.fn().mockResolvedValue(true),
        };

        act(() =>
            window.paypal.Buttons.mock.calls[0][0].onInit({}, onInitActions)
        );

        await waitFor(() => {
            expect(onInitCallbackMock).toHaveBeenCalled();
        });
        expect(onInitActions.disable).toHaveBeenCalled();
    });

    test("should enable the Buttons when disabled=true", async () => {
        const { container, rerender } = render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons
                    className="custom-class-name"
                    disabled={true}
                    onInit={jest.fn()}
                />
            </PayPalScriptProvider>
        );

        await waitFor(() => {
            expect(
                container
                    .querySelector("div.custom-class-name")
                    .classList.contains("paypal-buttons-disabled")
            ).toBeTruthy();
        });
        const onInitActions = {
            enable: jest.fn().mockResolvedValue(true),
            disable: jest.fn().mockResolvedValue(true),
        };

        act(() =>
            window.paypal.Buttons.mock.calls[0][0].onInit({}, onInitActions)
        );

        rerender(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons
                    className="custom-class-name"
                    disabled={false}
                    onInit={onInitActions}
                />
            </PayPalScriptProvider>
        );
        await waitFor(() => {
            expect(onInitActions.enable).toBeCalled();
        });
        expect(
            container
                .querySelector("div.custom-class-name")
                .classList.contains("paypal-buttons-disabled")
        ).toBeFalsy();
    });

    test("should re-render Buttons when any item from props.forceReRender changes", async () => {
        function ButtonWrapper({ initialAmount }) {
            const [amount, setAmount] = useState(initialAmount);
            const [currency, setCurrency] = useState("USD");
            return (
                <>
                    <button onClick={() => setAmount(amount + 1)}>
                        Update Amount
                    </button>
                    <button onClick={() => setCurrency("EUR")}>
                        Update Currency
                    </button>
                    <PayPalButtons forceReRender={[amount, currency]} />
                </>
            );
        }

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <ButtonWrapper initialOrderID="1" />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(window.paypal.Buttons).toHaveBeenCalledTimes(1)
        );

        fireEvent.click(screen.getByText("Update Amount"));

        // confirm re-render when the forceReRender value changes for first item
        await waitFor(() =>
            expect(window.paypal.Buttons).toHaveBeenCalledTimes(2)
        );

        fireEvent.click(screen.getByText("Update Currency"));

        // confirm re-render when the forceReRender value changes for second item
        await waitFor(() =>
            expect(window.paypal.Buttons).toHaveBeenCalledTimes(3)
        );
    });

    test("should not re-render Buttons from side-effect in props.createOrder function", async () => {
        function ButtonWrapper({ initialOrderID }) {
            const [orderID, setOrderID] = useState(initialOrderID);
            return (
                <>
                    <div data-testid="orderID">{orderID}</div>
                    <PayPalButtons createOrder={() => setOrderID("2")} />
                </>
            );
        }

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <ButtonWrapper initialOrderID="1" />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(window.paypal.Buttons).toHaveBeenCalledTimes(1)
        );

        expect(screen.getByTestId("orderID").innerHTML).toBe("1");

        act(() =>
            // call createOrder() to trigger a state change
            window.paypal.Buttons.mock.calls[0][0].createOrder()
        );

        await waitFor(() =>
            expect(screen.getByTestId("orderID").innerHTML).toBe("2")
        );

        // confirm that the Buttons were NOT reset by a side-effect in createOrder()
        expect(window.paypal.Buttons).toHaveBeenCalledTimes(1);
    });

    test("should render custom content when ineligible", async () => {
        window.paypal = {
            Buttons: jest.fn(() => ({
                close: jest.fn().mockResolvedValue(true),
                isEligible: jest.fn().mockReturnValue(false),
            })),
        };

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons className="test-button" />
            </PayPalScriptProvider>
        );

        // defaults to rendering null when ineligible
        await waitFor(() => {
            expect(window.paypal.Buttons).toBeCalled();
        });
        expect(
            window.paypal.Buttons.mock.results[0].value.isEligible
        ).toBeCalled();
        expect(
            window.paypal.Buttons.mock.results[0].value.isEligible.mock
                .results[0].value
        ).toBeFalsy();
    });

    test("should throw an error when no components are passed to the PayPalScriptProvider", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        // reset the paypal namespace to trigger the error
        window.paypal = {};

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });

    test("should throw an error when the 'buttons' component is missing from the components list passed to the PayPalScriptProvider", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        // reset the paypal namespace to trigger the error
        window.paypal = {};

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test",
                    components: "marks,messages",
                }}
            >
                <PayPalButtons />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });

    test("should catch and throw unexpected zoid render errors", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        window.paypal.Buttons = () => {
            return {
                close: jest.fn().mockResolvedValue(),
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn((element) => {
                    // simulate adding markup for paypal button
                    element.append(document.createElement("div"));
                    return Promise.reject("Unknown error");
                }),
            };
        };

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });

    test("should throw an error during initialization when style prop is invalid", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        window.paypal.Buttons = (options) => {
            if (
                options.style.color === "gold" &&
                options.fundingSource == "venmo"
            )
                throw new Error(
                    "Unexpected style.color for venmo button: gold, expected blue, silver, black, white"
                );
        };

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test",
                    components: "marks,messages",
                }}
            >
                <PayPalButtons
                    style={{ color: "gold" }}
                    fundingSource={FUNDING.VENMO}
                />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toBeCalled());
        expect(onError.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                message:
                    "Failed to render <PayPalButtons /> component. Failed to initialize:  Error: Unexpected style.color for venmo button: gold, expected blue, silver, black, white",
            })
        );
        spyConsoleError.mockRestore();
    });

    test("should safely ignore error on render process when paypal buttons container is no longer in the DOM ", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        const mockRender = jest
            .fn()
            .mockRejectedValue(new Error("Unknown error"));
        window.paypal.Buttons = () => {
            return {
                close: jest.fn().mockResolvedValue(),
                isEligible: jest.fn().mockReturnValue(true),
                render: mockRender,
            };
        };

        const { container } = render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons className="test-children" />
            </PayPalScriptProvider>
        );

        await waitFor(() => expect(mockRender).toBeCalled());
        expect(
            container.querySelector("div.test-children").hasChildNodes()
        ).toBeFalsy();
        spyConsoleError.mockRestore();
    });
});
