import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { BraintreePayPalOneTimePaymentButton } from "./BraintreePayPalButton";
import { useBraintreePayPalOneTimePaymentSession } from "../../hooks/Braintree/useBraintreePayPalOneTimePaymentSession";
import { useBraintreePayPal } from "../../hooks/Braintree/useBraintreePayPal";

jest.mock(
  "../../hooks/Braintree/useBraintreePayPalOneTimePaymentSession",
  () => ({
    useBraintreePayPalOneTimePaymentSession: jest.fn(),
  }),
);
jest.mock("../../hooks/Braintree/useBraintreePayPal", () => ({
  useBraintreePayPal: jest.fn(),
}));

describe("BraintreePayPalOneTimePaymentButton", () => {
  const mockHandleClick = jest.fn();
  const mockUseBraintreePayPalOneTimePaymentSession =
    useBraintreePayPalOneTimePaymentSession as jest.Mock;
  const mockUseBraintreePayPal = useBraintreePayPal as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBraintreePayPalOneTimePaymentSession.mockReturnValue({
      error: null,
      isPending: false,
      handleClick: mockHandleClick,
    });
    mockUseBraintreePayPal.mockReturnValue({
      isHydrated: true,
    });
  });

  it("should render paypal-button when hydrated", () => {
    const { container } = render(
      <BraintreePayPalOneTimePaymentButton
        onApprove={() => Promise.resolve()}
        amount="10.00"
        currency="USD"
      />,
    );
    expect(container.querySelector("paypal-button")).toBeInTheDocument();
  });

  it("should render a div when not hydrated", () => {
    mockUseBraintreePayPal.mockReturnValue({
      isHydrated: false,
    });
    const { container } = render(
      <BraintreePayPalOneTimePaymentButton
        onApprove={() => Promise.resolve()}
        amount="10.00"
        currency="USD"
      />,
    );
    expect(container.querySelector("paypal-button")).not.toBeInTheDocument();
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("should call handleClick when button is clicked", () => {
    const { container } = render(
      <BraintreePayPalOneTimePaymentButton
        onApprove={() => Promise.resolve()}
        amount="10.00"
        currency="USD"
      />,
    );
    const button = container.querySelector("paypal-button");

    // @ts-expect-error button should be defined at this point, test will error if not
    fireEvent.click(button);

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  it("should disable the button when disabled=true is given as a prop", () => {
    const { container } = render(
      <BraintreePayPalOneTimePaymentButton
        onApprove={() => Promise.resolve()}
        amount="10.00"
        currency="USD"
        disabled={true}
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("should disable button when error is present", () => {
    jest.spyOn(console, "error").mockImplementation();
    mockUseBraintreePayPalOneTimePaymentSession.mockReturnValue({
      error: new Error("Test error"),
      isPending: false,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreePayPalOneTimePaymentButton
        onApprove={() => Promise.resolve()}
        amount="10.00"
        currency="USD"
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("should not disable button when error is null", () => {
    mockUseBraintreePayPalOneTimePaymentSession.mockReturnValue({
      error: null,
      isPending: false,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreePayPalOneTimePaymentButton
        onApprove={() => Promise.resolve()}
        amount="10.00"
        currency="USD"
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).not.toHaveAttribute("disabled");
  });

  it("should disable button when isPending is true", () => {
    mockUseBraintreePayPalOneTimePaymentSession.mockReturnValue({
      error: null,
      isPending: true,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreePayPalOneTimePaymentButton
        onApprove={() => Promise.resolve()}
        amount="10.00"
        currency="USD"
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("disabled");
  });

  it("should pass type prop to paypal-button", () => {
    const { container } = render(
      <BraintreePayPalOneTimePaymentButton
        onApprove={() => Promise.resolve()}
        amount="10.00"
        currency="USD"
        type="subscribe"
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toHaveAttribute("type", "subscribe");
  });

  it("should pass hook props to useBraintreePayPalOneTimePaymentSession", () => {
    const onApprove = () => Promise.resolve();
    render(
      <BraintreePayPalOneTimePaymentButton
        amount="10.00"
        currency="USD"
        onApprove={onApprove}
      />,
    );
    expect(mockUseBraintreePayPalOneTimePaymentSession).toHaveBeenCalledWith({
      onApprove,
      onCancel: undefined,
      onError: undefined,
      onShippingAddressChange: undefined,
      onShippingOptionsChange: undefined,
      amount: "10.00",
      currency: "USD",
      intent: undefined,
      commit: undefined,
      offerCredit: undefined,
      userAuthenticationEmail: undefined,
      returnUrl: undefined,
      cancelUrl: undefined,
      displayName: undefined,
      presentationMode: undefined,
      lineItems: undefined,
      shippingOptions: undefined,
      amountBreakdown: undefined,
    });
  });

  it("should log error to console when an error from the hook is present", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const testError = new Error("Test error");
    mockUseBraintreePayPalOneTimePaymentSession.mockReturnValue({
      error: testError,
      isPending: false,
      handleClick: mockHandleClick,
    });
    render(
      <BraintreePayPalOneTimePaymentButton
        onApprove={() => Promise.resolve()}
        amount="10.00"
        currency="USD"
      />,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    consoleErrorSpy.mockRestore();
  });
});
