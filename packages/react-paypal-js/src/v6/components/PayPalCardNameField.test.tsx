import React from "react";
import { render } from "@testing-library/react";

import { PayPalCardNameField } from "./PayPalCardNameField";
import { PayPalCardField } from "./PayPalCardField";

jest.mock("./PayPalCardField", () => ({
  PayPalCardField: jest.fn(() => <div data-testid="mock-card-field" />),
}));

const mockPayPalCardField = PayPalCardField as jest.MockedFunction<
  typeof PayPalCardField
>;

const fieldType = "name";

describe("PayPalCardNameField", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should pass type='name' to PayPalCardField", () => {
    render(<PayPalCardNameField />);
    expect(mockPayPalCardField.mock.calls[0][0]).toEqual(
      expect.objectContaining({ type: fieldType }),
    );
  });

  it("should render PayPalCardField with the correct props", () => {
    const testProps = {
      placeholder: "Enter your name",
      containerClassName: "test-container",
      style: {
        input: {
          background: "lightgray",
        },
      },
    };

    render(<PayPalCardNameField {...testProps} />);

    expect(mockPayPalCardField.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        type: fieldType,
        ...testProps,
      }),
    );
  });
});
