import React from "react";
import { render, waitFor } from "@testing-library/react";

import { PayPalScriptProvider, usePayPalScriptReducer } from "../ScriptContext";
import PayPalMarks from "./PayPalMarks";
import { FUNDING } from "@paypal/sdk-constants";

describe("<PayPalMarks />", () => {
    beforeEach(() => {
        window.paypal = {};

        jest.spyOn(console, "error");
        console.error.mockImplementation(() => {});
    });
    afterEach(() => {
        console.error.mockRestore();
    });

    test("should pass props to window.paypal.Marks()", async () => {
        window.paypal.Marks = () => {
            return {
                isEligible: jest.fn(),
                render: jest.fn(),
            };
        };

        const spyOnMarks = jest.spyOn(window.paypal, "Marks");

        render(
            <PayPalScriptProvider
                options={{ "client-id": "sb", components: "marks" }}
            >
                <PayPalMarks fundingSource={FUNDING.CREDIT} />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(spyOnMarks).toHaveBeenCalledWith({
                fundingSource: FUNDING.CREDIT,
            })
        );
    });

    test("should throw an error when no components are passed to the PayPalScriptProvider", () => {
        expect(() =>
            render(
                <PayPalScriptProvider options={{ "client-id": "sb" }}>
                    <SetIsLoadedToTrue />
                    <PayPalMarks />
                </PayPalScriptProvider>
            )
        ).toThrowErrorMatchingSnapshot();
    });

    test("should throw an error when the 'marks' component is missing from the components list passed to the PayPalScriptProvider", () => {
        expect(() =>
            render(
                <PayPalScriptProvider
                    options={{
                        "client-id": "sb",
                        components: "buttons,messages",
                    }}
                >
                    <SetIsLoadedToTrue />
                    <PayPalMarks />
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
