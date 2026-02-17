import React from "react";
import { render } from "@testing-library/react";

import { PayPalCardCvvField } from "./PayPalCardCvvField";
import { PayPalCardField } from "./PayPalCardField";

jest.mock("./PayPalCardField", () => ({
    PayPalCardField: jest.fn(() => <div data-testid="mock-card-field" />),
}));

const mockPayPalCardField = PayPalCardField as jest.MockedFunction<
    typeof PayPalCardField
>;

const fieldType = "cvv";

describe("PayPalCardCvvField", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Should pass type='cvv' to PayPalCardField", () => {
        render(<PayPalCardCvvField />);
        expect(mockPayPalCardField.mock.calls[0][0]).toEqual(
            expect.objectContaining({ type: fieldType }),
        );
    });

    it("should render PayPalCardField with the correct props", () => {
        const testProps = {
            placeholder: "Enter CVV",
            containerClassName: "test-container",
            style: {
                input: {
                    background: "lightgray",
                },
            },
        };

        render(<PayPalCardCvvField {...testProps} />);

        expect(mockPayPalCardField.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                type: fieldType,
                ...testProps,
            }),
        );
    });
});
