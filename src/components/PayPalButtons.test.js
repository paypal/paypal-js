import React from "react";
import PropTypes from "prop-types";
import { render, waitFor } from "@testing-library/react";

import { PayPalScriptProvider } from "../ScriptContext";
import PayPalButtons from "./PayPalButtons";
import { FUNDING } from "@paypal/sdk-constants";
import { loadScript } from "@paypal/paypal-js";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

describe("<PayPalButtons />", () => {
    let consoleErrorSpy;
    beforeEach(() => {
        window.paypal = {};
        loadScript.mockResolvedValue(window.paypal);

        consoleErrorSpy = jest.spyOn(console, "error");
        console.error.mockImplementation(() => {});
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should pass props to window.paypal.Buttons()", async () => {
        window.paypal = {
            Buttons: jest.fn(() => ({
                close: jest.fn(),
                isEligible: jest.fn(),
                render: jest.fn(),
            })),
        };

        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <PayPalButtons
                    fundingSource={FUNDING.CREDIT}
                    style={{ layout: "horizontal" }}
                    shippingPreference="GET_FROM_FILE"
                />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(window.paypal.Buttons).toHaveBeenCalledWith({
                shippingPreference: "GET_FROM_FILE",
                style: { layout: "horizontal" },
                fundingSource: FUNDING.CREDIT,
            })
        );
    });
    test("should throw an error when no components are passed to the PayPalScriptProvider", async () => {
        const onError = jest.fn();

        const wrapper = ({ children }) => (
            <ErrorBoundary onError={onError}>{children}</ErrorBoundary>
        );

        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
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
                    "client-id": "sb",
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

    test("should catch and log zoid render errors", async () => {
        window.paypal.Buttons = () => {
            return {
                close: jest.fn(),
                isEligible: jest.fn().mockReturnValue(true),
                render: jest
                    .fn()
                    .mockReturnValue(Promise.reject("Window closed")),
            };
        };

        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <PayPalButtons />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringMatching(/Window closed/)
            )
        );
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

ErrorBoundary.propTypes = {
    onError: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};
