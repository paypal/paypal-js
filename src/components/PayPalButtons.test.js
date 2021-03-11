import React, { useState } from "react";
import {
    render,
    waitFor,
    screen,
    fireEvent,
    act,
} from "@testing-library/react";

import { PayPalScriptProvider } from "../ScriptContext";
import PayPalButtons from "./PayPalButtons";
import { FUNDING } from "@paypal/sdk-constants";
import { loadScript } from "@paypal/paypal-js";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

describe("<PayPalButtons />", () => {
    beforeEach(() => {
        window.paypal = {};
        loadScript.mockResolvedValue(window.paypal);
        const consoleErrorSpy = jest.spyOn(console, "error");
        consoleErrorSpy.mockImplementation(() => {});
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should pass props to window.paypal.Buttons()", async () => {
        window.paypal = {
            Buttons: jest.fn(() => ({
                close: jest.fn(),
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn().mockResolvedValue({}),
            })),
        };

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
        window.paypal = {
            Buttons: jest.fn(() => ({
                close: jest.fn(),
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn().mockResolvedValue({}),
            })),
        };

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
        window.paypal = {
            Buttons: jest.fn(() => ({
                close: jest.fn(),
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn().mockResolvedValue({}),
            })),
        };

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
            expect(window.paypal.Buttons).toHaveBeenCalled();
        });

        const onInitActions = {
            enable: jest.fn(),
            disable: jest.fn(),
        };

        act(() =>
            window.paypal.Buttons.mock.calls[0][0].onInit({}, onInitActions)
        );

        await waitFor(() => {
            expect(onInitCallbackMock).toHaveBeenCalled();
            expect(onInitActions.disable).toHaveBeenCalled();
        });
    });

    test("should re-render Buttons when props.forceReRender changes", async () => {
        window.paypal = {
            Buttons: jest.fn(() => ({
                close: jest.fn(),
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn().mockResolvedValue({}),
            })),
        };

        function ButtonWrapper({ initialAmount }) {
            const [amount, setAmount] = useState(initialAmount);
            return (
                <>
                    <button onClick={() => setAmount(amount + 1)}>
                        Update Amount
                    </button>
                    <PayPalButtons forceReRender={amount} />
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

        // confirm re-render when the forceReRender value changes
        await waitFor(() =>
            expect(window.paypal.Buttons).toHaveBeenCalledTimes(2)
        );
    });

    test("should not re-render Buttons from side-effect in props.createOrder function", async () => {
        window.paypal = {
            Buttons: jest.fn(() => ({
                close: jest.fn(),
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn().mockResolvedValue({}),
            })),
        };

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

    test("should throw an error when no components are passed to the PayPalScriptProvider", async () => {
        const onError = jest.fn();

        const wrapper = ({ children }) => (
            <ErrorBoundary onError={onError}>{children}</ErrorBoundary>
        );

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
    });

    test("should throw an error when the 'buttons' component is missing from the components list passed to the PayPalScriptProvider", async () => {
        const onError = jest.fn();

        const wrapper = ({ children }) => (
            <ErrorBoundary onError={onError}>{children}</ErrorBoundary>
        );

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
    });

    test("should catch and throw unexpected zoid render errors", async () => {
        window.paypal.Buttons = () => {
            return {
                close: jest.fn(),
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn((element) => {
                    // simulate adding markup for paypal button
                    element.append(document.createElement("div"));
                    return Promise.reject("Unknown error");
                }),
            };
        };

        const onError = jest.fn();

        const wrapper = ({ children }) => (
            <ErrorBoundary onError={onError}>{children}</ErrorBoundary>
        );

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalButtons />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
    });
});

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error) {
        this.setState({ hasError: true });
        this.props.onError(error);
    }

    render() {
        return !this.state.hasError && this.props.children;
    }
}
