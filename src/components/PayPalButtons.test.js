import React from "react";
import { render, waitFor } from "@testing-library/react";

import { PayPalScriptProvider, usePayPalScriptReducer } from "../ScriptContext";
import PayPalButtons from "./PayPalButtons";
import { FUNDING } from "@paypal/sdk-constants";

describe("<PayPalButtons />", () => {
    beforeEach(() => {
        window.paypal = {};

        jest.spyOn(console, "error");
        console.error.mockImplementation(() => {});
    });
    afterEach(() => {
        console.error.mockRestore();
    });

    test("should pass props to window.paypal.Buttons()", async () => {
        window.paypal.Buttons = () => {
            return {
                close: jest.fn(),
                isEligible: jest.fn(),
                render: jest.fn(),
            };
        };

        const spyOnButtons = jest.spyOn(window.paypal, "Buttons");

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
            expect(spyOnButtons).toHaveBeenCalledWith({
                shippingPreference: "GET_FROM_FILE",
                style: { layout: "horizontal" },
                fundingSource: FUNDING.CREDIT,
            })
        );
    });
    test("should throw an error when no components are passed to the PayPalScriptProvider", () => {
        expect(() =>
            render(
                <PayPalScriptProvider options={{ "client-id": "sb" }}>
                    <SetIsLoadedToTrue />
                    <PayPalButtons />
                </PayPalScriptProvider>
            )
        ).toThrowErrorMatchingSnapshot();
    });

    test("should throw an error when the 'buttons' component is missing from the components list passed to the PayPalScriptProvider", () => {
        expect(() =>
            render(
                <PayPalScriptProvider
                    options={{
                        "client-id": "sb",
                        components: "marks,messages",
                    }}
                >
                    <SetIsLoadedToTrue />
                    <PayPalButtons />
                </PayPalScriptProvider>
            )
        ).toThrowErrorMatchingSnapshot();
    });
});

// immediately sets the PayPalScriptProvider `isLoaded` state to true
function SetIsLoadedToTrue() {
    const [, dispatch] = usePayPalScriptReducer();
    dispatch({ type: "setIsLoaded", value: true });
    return null;
}
