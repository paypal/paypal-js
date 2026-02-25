import React from "react";
import { render } from "@testing-library/react";

import { PayPalCardNumberField } from "./PayPalCardNumberField";
import { PayPalCardField } from "./PayPalCardField";

jest.mock("./PayPalCardField", () => ({
    PayPalCardField: jest.fn(() => <div data-testid="mock-card-field" />),
}));

const mockPayPalCardField = PayPalCardField as jest.MockedFunction<
    typeof PayPalCardField
>;

const fieldType = "number";

describe("PayPalCardNumberField", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Should pass type='number' to PayPalCardField", () => {
        render(<PayPalCardNumberField />);
        expect(mockPayPalCardField.mock.calls[0][0]).toEqual(
            expect.objectContaining({ type: fieldType }),
        );
    });

    it("should render PayPalCardField with the correct props", () => {
        const testProps = {
            placeholder: "Enter card number",
            containerClassName: "test-container",
            style: {
                input: {
                    background: "lightgray",
                },
            },
        };

        render(<PayPalCardNumberField {...testProps} />);

        expect(mockPayPalCardField.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                type: fieldType,
                ...testProps,
            }),
        );
    });
});
