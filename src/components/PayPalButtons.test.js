import React from "react";
import { render, waitFor } from "@testing-library/react";

import { ScriptProvider, useScriptReducer } from "../ScriptContext";
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
            <ScriptProvider options={{ "client-id": "sb" }}>
                <PayPalButtons
                    fundingSource={FUNDING.CREDIT}
                    style={{ layout: "horizontal" }}
                    shippingPreference="GET_FROM_FILE"
                />
            </ScriptProvider>
        );

        await waitFor(() =>
            expect(spyOnButtons).toHaveBeenCalledWith({
                shippingPreference: "GET_FROM_FILE",
                style: { layout: "horizontal" },
                fundingSource: FUNDING.CREDIT,
            })
        );
    });
    test("should throw an error when no components are passed to the ScriptProvider", () => {
        expect(() =>
            render(
                <ScriptProvider options={{ "client-id": "sb" }}>
                    <SetIsLoadedToTrue />
                    <PayPalButtons />
                </ScriptProvider>
            )
        ).toThrowErrorMatchingSnapshot();
    });

    test("should throw an error when the 'buttons' component is missing from the components list passed to the ScriptProvider", () => {
        expect(() =>
            render(
                <ScriptProvider
                    options={{
                        "client-id": "sb",
                        components: "marks,messages",
                    }}
                >
                    <SetIsLoadedToTrue />
                    <PayPalButtons />
                </ScriptProvider>
            )
        ).toThrowErrorMatchingSnapshot();
    });
});

// immediately sets the ScriptProvider `isLoaded` state to true
function SetIsLoadedToTrue() {
    const [, dispatch] = useScriptReducer();
    dispatch({ type: "setIsLoaded", value: true });
    return null;
}
