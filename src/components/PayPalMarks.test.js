import React from "react";
import { render, waitFor } from "@testing-library/react";

import { ScriptProvider } from "../ScriptContext";
import PayPalMarks from "./PayPalMarks";
import { FUNDING } from "@paypal/sdk-constants";

describe("<PayPalMarks />", () => {
    beforeEach(() => {
        window.paypal = {
            Marks: function () {
                return {
                    isEligible: jest.fn(),
                    render: jest.fn(),
                };
            },
        };
    });

    test("should pass props to window.paypal.Marks()", async () => {
        const spyOnMarks = jest.spyOn(window.paypal, "Marks");

        render(
            <ScriptProvider options={{ "client-id": "sb" }}>
                <PayPalMarks fundingSource={FUNDING.CREDIT} />
            </ScriptProvider>
        );

        await waitFor(() =>
            expect(spyOnMarks).toHaveBeenCalledWith({
                fundingSource: FUNDING.CREDIT,
            })
        );
    });
});
