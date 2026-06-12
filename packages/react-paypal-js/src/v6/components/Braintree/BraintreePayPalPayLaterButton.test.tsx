import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { BraintreePayPalPayLaterButton } from "./BraintreePayPalPayLaterButton";
import { useBraintreePayPalPayLaterSession } from "../../hooks/Braintree/useBraintreePayPalPayLaterSession";
import { useBraintreePayPal } from "../../hooks/Braintree/useBraintreePayPal";

jest.mock("../../hooks/Braintree/useBraintreePayPalPayLaterSession", () => ({
  useBraintreePayPalPayLaterSession: jest.fn(),
}));
jest.mock("../../hooks/Braintree/useBraintreePayPal", () => ({
  useBraintreePayPal: jest.fn(),
}));

describe("BraintreePayPalPayLaterButton", () => {
  const mockHandleClick = jest.fn();
  const mockGetDetails = jest.fn();
  const mockUseBraintreePayPalPayLaterSession =
    useBraintreePayPalPayLaterSession as jest.Mock;
  const mockUseBraintreePayPal = useBraintreePayPal as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDetails.mockReturnValue({
      countryCode: "US",
      productCode: "PAY_LATER",
    });
    mockUseBraintreePayPalPayLaterSession.mockReturnValue({
      error: null,
      isPending: false,
      handleClick: mockHandleClick,
    });
    mockUseBraintreePayPal.mockReturnValue({
      isHydrated: true,
      eligiblePaymentMethods: { getDetails: mockGetDetails },
    });
  });

  it("should render paypal-pay-later-button when hydrated", () => {
    const { container } = render(
      <BraintreePayPalPayLaterButton
        amount="100.00"
        currency="USD"
        onApprove={() => Promise.resolve()}
      />,
    );
    expect(
      container.querySelector("paypal-pay-later-button"),
    ).toBeInTheDocument();
  });

  it("should render a div when not hydrated", () => {
    mockUseBraintreePayPal.mockReturnValue({
      isHydrated: false,
      eligiblePaymentMethods: { getDetails: mockGetDetails },
    });
    const { container } = render(
      <BraintreePayPalPayLaterButton
        amount="100.00"
        currency="USD"
        onApprove={() => Promise.resolve()}
      />,
    );
    expect(
      container.querySelector("paypal-pay-later-button"),
    ).not.toBeInTheDocument();
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("should call handleClick when button is clicked", () => {
    const { container } = render(
      <BraintreePayPalPayLaterButton
        amount="100.00"
        currency="USD"
        onApprove={() => Promise.resolve()}
      />,
    );
    const button = container.querySelector("paypal-pay-later-button");

    // @ts-expect-error button should be defined at this point, test will error if not
    fireEvent.click(button);

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  it("should populate countryCode and productCode from eligibility", () => {
    const { container } = render(
      <BraintreePayPalPayLaterButton
        amount="100.00"
        currency="USD"
        onApprove={() => Promise.resolve()}
      />,
    );
    const button = container.querySelector("paypal-pay-later-button");
    expect(mockGetDetails).toHaveBeenCalledWith("paylater");
    expect(button).toHaveAttribute("countryCode", "US");
    expect(button).toHaveAttribute("productCode", "PAY_LATER");
  });

  it("should render without eligibility details when not available", () => {
    mockUseBraintreePayPal.mockReturnValue({
      isHydrated: true,
      eligiblePaymentMethods: null,
    });
    const { container } = render(
      <BraintreePayPalPayLaterButton
        amount="100.00"
        currency="USD"
        onApprove={() => Promise.resolve()}
      />,
    );
    const button = container.querySelector("paypal-pay-later-button");
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute("countryCode");
    expect(button).not.toHaveAttribute("productCode");
  });

  it("should disable the button when disabled=true is given as a prop", () => {
    const { container } = render(
      <BraintreePayPalPayLaterButton
        amount="100.00"
        currency="USD"
        onApprove={() => Promise.resolve()}
        disabled={true}
      />,
    );
    const button = container.querySelector("paypal-pay-later-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("should disable button when error is present", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    mockUseBraintreePayPalPayLaterSession.mockReturnValue({
      error: new Error("Test error"),
      isPending: false,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreePayPalPayLaterButton
        amount="100.00"
        currency="USD"
        onApprove={() => Promise.resolve()}
      />,
    );
    const button = container.querySelector("paypal-pay-later-button");
    expect(button).toHaveAttribute("disabled");
    consoleErrorSpy.mockRestore();
  });

  it("should not disable button when error is null", () => {
    mockUseBraintreePayPalPayLaterSession.mockReturnValue({
      error: null,
      isPending: false,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreePayPalPayLaterButton
        amount="100.00"
        currency="USD"
        onApprove={() => Promise.resolve()}
      />,
    );
    const button = container.querySelector("paypal-pay-later-button");
    expect(button).not.toHaveAttribute("disabled");
  });

  it("should disable button when isPending is true", () => {
    mockUseBraintreePayPalPayLaterSession.mockReturnValue({
      error: null,
      isPending: true,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreePayPalPayLaterButton
        amount="100.00"
        currency="USD"
        onApprove={() => Promise.resolve()}
      />,
    );
    const button = container.querySelector("paypal-pay-later-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("disabled");
  });

  it("should pass hook props to useBraintreePayPalPayLaterSession", () => {
    const onApprove = () => Promise.resolve();
    render(
      <BraintreePayPalPayLaterButton
        onApprove={onApprove}
        amount="100.00"
        currency="USD"
      />,
    );
    expect(mockUseBraintreePayPalPayLaterSession).toHaveBeenCalledWith({
      onApprove,
      amount: "100.00",
      currency: "USD",
    });
  });

  it("should log error to console when an error from the hook is present", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const testError = new Error("Test error");
    mockUseBraintreePayPalPayLaterSession.mockReturnValue({
      error: testError,
      isPending: false,
      handleClick: mockHandleClick,
    });
    render(
      <BraintreePayPalPayLaterButton
        amount="100.00"
        currency="USD"
        onApprove={() => Promise.resolve()}
      />,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    consoleErrorSpy.mockRestore();
  });
});
