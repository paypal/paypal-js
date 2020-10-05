import React from "react";
import { render, waitFor } from "@testing-library/react";

import { ScriptProvider } from "../ScriptContext";
import PayPalButtons from "./PayPalButtons";
import { FUNDING } from "@paypal/sdk-constants";

describe("<PayPalButtons />", () => {
    beforeEach(() => {
        window.paypal = {
            Buttons: function () {
                return {
                    close: jest.fn(),
                    isEligible: jest.fn(),
                    render: jest.fn(),
                };
            },
        };
    });

    test("should pass props to window.paypal.Buttons()", async () => {
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
});
