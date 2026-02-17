import React from "react";
import { render } from "@testing-library/react";

import { PayPalCardExpiryField } from "./PayPalCardExpiryField";
import { PayPalCardField } from "./PayPalCardField";

jest.mock("./PayPalCardField", () => ({
    PayPalCardField: jest.fn(() => <div data-testid="mock-card-field" />),
}));

const mockPayPalCardField = PayPalCardField as jest.MockedFunction<
    typeof PayPalCardField
>;

const fieldType = "expiry";

describe("PayPalCardExpiryField", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Should pass type='expiry' to PayPalCardField", () => {
        render(<PayPalCardExpiryField />);
        expect(mockPayPalCardField.mock.calls[0][0]).toEqual(
            expect.objectContaining({ type: fieldType }),
        );
    });

    it("should render PayPalCardField with the correct props", () => {
        const testProps = {
            placeholder: "Enter expiry date",
            containerClassName: "test-container",
            style: {
                input: {
                    background: "lightgray",
                },
            },
        };

        render(<PayPalCardExpiryField {...testProps} />);

        expect(mockPayPalCardField.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                type: fieldType,
                ...testProps,
            }),
        );
    });
});
