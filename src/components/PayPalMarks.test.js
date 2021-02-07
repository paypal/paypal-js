import React from "react";
import { render, waitFor } from "@testing-library/react";

import { PayPalScriptProvider } from "../ScriptContext";
import PayPalMarks from "./PayPalMarks";
import { FUNDING } from "@paypal/sdk-constants";
import { loadScript } from "@paypal/paypal-js";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

describe("<PayPalMarks />", () => {
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

    test("should pass props to window.paypal.Marks()", async () => {
        window.paypal = {
            Marks: jest.fn(() => ({
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn().mockResolvedValue({}),
            })),
        };

        render(
            <PayPalScriptProvider
                options={{ "client-id": "sb", components: "marks" }}
            >
                <PayPalMarks fundingSource={FUNDING.CREDIT} />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(window.paypal.Marks).toHaveBeenCalledWith({
                fundingSource: FUNDING.CREDIT,
            })
        );
    });

    test("should use className prop and add to div container", async () => {
        window.paypal = {
            Marks: jest.fn(() => ({
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn().mockResolvedValue({}),
            })),
        };

        render(
            <PayPalScriptProvider
                options={{ "client-id": "sb", components: "marks" }}
            >
                <PayPalMarks className="custom-class-name" />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(document.querySelector("div.custom-class-name")).toBeTruthy()
        );
    });

    test("should throw an error when no components are passed to the PayPalScriptProvider", async () => {
        const onError = jest.fn();

        const wrapper = ({ children }) => (
            <ErrorBoundary onError={onError}>{children}</ErrorBoundary>
        );

        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <PayPalMarks />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
    });

    test("should throw an error when the 'marks' component is missing from the components list passed to the PayPalScriptProvider", async () => {
        const onError = jest.fn();

        const wrapper = ({ children }) => (
            <ErrorBoundary onError={onError}>{children}</ErrorBoundary>
        );

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "sb",
                    components: "buttons,messages",
                }}
            >
                <PayPalMarks />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
    });

    test("should catch and log zoid render errors", async () => {
        window.paypal.Marks = () => ({
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn().mockRejectedValue("Window closed"),
        });

        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <PayPalMarks />
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
