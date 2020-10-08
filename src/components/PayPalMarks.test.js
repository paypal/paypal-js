import React from "react";
import { render, waitFor } from "@testing-library/react";

import { ScriptProvider, useScriptReducer } from "../ScriptContext";
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
            <ScriptProvider
                options={{ "client-id": "sb", components: "marks" }}
            >
                <PayPalMarks fundingSource={FUNDING.CREDIT} />
            </ScriptProvider>
        );

        await waitFor(() =>
            expect(spyOnMarks).toHaveBeenCalledWith({
                fundingSource: FUNDING.CREDIT,
            })
        );
    });

    test("should throw an error when no components are passed to the ScriptProvider", () => {
        expect(() =>
            render(
                <ScriptProvider options={{ "client-id": "sb" }}>
                    <SetIsLoadedToTrue />
                    <PayPalMarks />
                </ScriptProvider>
            )
        ).toThrowErrorMatchingSnapshot();
    });

    test("should throw an error when the 'marks' component is missing from the components list passed to the ScriptProvider", () => {
        expect(() =>
            render(
                <ScriptProvider
                    options={{
                        "client-id": "sb",
                        components: "buttons,messages",
                    }}
                >
                    <SetIsLoadedToTrue />
                    <PayPalMarks />
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
