import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { BraintreePayPalBillingAgreementButton } from "./BraintreePayPalBillingAgreementButton";
import { useBraintreePayPalBillingAgreementSession } from "../../hooks/Braintree/useBraintreePayPalBillingAgreementSession";
import { useBraintreePayPal } from "../../hooks/Braintree/useBraintreePayPal";

jest.mock(
  "../../hooks/Braintree/useBraintreePAyPalBillingAgreementSession",
  () => ({
    useBraintreePayPalBillingAgreementSession: jest.fn(),
  }),
);
jest.mock("../../hooks/Braintree/useBraintreePayPal", () => ({
  useBraintreePayPal: jest.fn(),
}));

describe("BraintreePayPalBillingAgreementButton", () => {
  const mockHandleClick = jest.fn();
  const mockUseBraintreePayPalBillingAgreementSession =
    useBraintreePayPalBillingAgreementSession as jest.Mock;
  const mockUseBraintreePayPal = useBraintreePayPal as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBraintreePayPalBillingAgreementSession.mockReturnValue({
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
      <BraintreePayPalBillingAgreementButton
        onApprove={() => Promise.resolve()}
      />,
    );
    expect(container.querySelector("paypal-button")).toBeInTheDocument();
  });

  it("should render a div when not hydrated", () => {
    mockUseBraintreePayPal.mockReturnValue({
      isHydrated: false,
    });
    const { container } = render(
      <BraintreePayPalBillingAgreementButton
        onApprove={() => Promise.resolve()}
      />,
    );
    expect(container.querySelector("paypal-button")).not.toBeInTheDocument();
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("should call handleClick when button is clicked", () => {
    const { container } = render(
      <BraintreePayPalBillingAgreementButton
        onApprove={() => Promise.resolve()}
      />,
    );
    const button = container.querySelector("paypal-button");

    // @ts-expect-error button should be defined at this point, test will error if not
    fireEvent.click(button);

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  it("should disable the button when disabled=true is given as a prop", () => {
    const { container } = render(
      <BraintreePayPalBillingAgreementButton
        onApprove={() => Promise.resolve()}
        disabled={true}
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("should disable button when error is present", () => {
    jest.spyOn(console, "error").mockImplementation();
    mockUseBraintreePayPalBillingAgreementSession.mockReturnValue({
      error: new Error("Test error"),
      isPending: false,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreePayPalBillingAgreementButton
        onApprove={() => Promise.resolve()}
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("should not disable button when error is null", () => {
    mockUseBraintreePayPalBillingAgreementSession.mockReturnValue({
      error: null,
      isPending: false,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreePayPalBillingAgreementButton
        onApprove={() => Promise.resolve()}
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).not.toHaveAttribute("disabled");
  });

  it("should disable button when isPending is true", () => {
    mockUseBraintreePayPalBillingAgreementSession.mockReturnValue({
      error: null,
      isPending: true,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreePayPalBillingAgreementButton
        onApprove={() => Promise.resolve()}
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("disabled");
  });

  it("should pass type prop to paypal-button", () => {
    const { container } = render(
      <BraintreePayPalBillingAgreementButton
        onApprove={() => Promise.resolve()}
        type="subscribe"
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toHaveAttribute("type", "subscribe");
  });

  it("should pass hook props to useBraintreePAyPalBillingAgreementSession", () => {
    const onApprove = () => Promise.resolve();
    render(
      <BraintreePayPalBillingAgreementButton
        onApprove={onApprove}
        billingAgreementDescription="Monthly subscription"
        planType="SUBSCRIPTION"
      />,
    );
    expect(mockUseBraintreePayPalBillingAgreementSession).toHaveBeenCalledWith({
      onApprove,
      onCancel: undefined,
      onError: undefined,
      billingAgreementDescription: "Monthly subscription",
      planType: "SUBSCRIPTION",
      amount: undefined,
      currency: undefined,
      offerCredit: undefined,
      userAction: undefined,
      displayName: undefined,
      returnUrl: undefined,
      cancelUrl: undefined,
      presentationMode: undefined,
      planMetadata: undefined,
      shippingAddressOverride: undefined,
    });
  });

  it("should log error to console when an error from the hook is present", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const testError = new Error("Test error");
    mockUseBraintreePayPalBillingAgreementSession.mockReturnValue({
      error: testError,
      isPending: false,
      handleClick: mockHandleClick,
    });
    render(
      <BraintreePayPalBillingAgreementButton
        onApprove={() => Promise.resolve()}
      />,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    consoleErrorSpy.mockRestore();
  });
});
