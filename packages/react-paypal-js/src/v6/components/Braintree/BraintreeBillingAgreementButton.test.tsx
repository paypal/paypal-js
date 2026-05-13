import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { BraintreeBillingAgreementButton } from "./BraintreeBillingAgreementButton";
import { useBraintreeBillingAgreementSession } from "../../hooks/Braintree/useBraintreeBillingAgreementSession";
import { useBraintreePayPal } from "../../hooks/Braintree/useBraintreePayPal";

jest.mock("../../hooks/Braintree/useBraintreeBillingAgreementSession", () => ({
  useBraintreeBillingAgreementSession: jest.fn(),
}));
jest.mock("../../hooks/Braintree/useBraintreePayPal", () => ({
  useBraintreePayPal: jest.fn(),
}));

describe("BraintreeBillingAgreementButton", () => {
  const mockHandleClick = jest.fn();
  const mockUseBraintreeBillingAgreementSession =
    useBraintreeBillingAgreementSession as jest.Mock;
  const mockUseBraintreePayPal = useBraintreePayPal as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBraintreeBillingAgreementSession.mockReturnValue({
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
      <BraintreeBillingAgreementButton onApprove={() => Promise.resolve()} />,
    );
    expect(container.querySelector("paypal-button")).toBeInTheDocument();
  });

  it("should render a div when not hydrated", () => {
    mockUseBraintreePayPal.mockReturnValue({
      isHydrated: false,
    });
    const { container } = render(
      <BraintreeBillingAgreementButton onApprove={() => Promise.resolve()} />,
    );
    expect(container.querySelector("paypal-button")).not.toBeInTheDocument();
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("should call handleClick when button is clicked", () => {
    const { container } = render(
      <BraintreeBillingAgreementButton onApprove={() => Promise.resolve()} />,
    );
    const button = container.querySelector("paypal-button");

    // @ts-expect-error button should be defined at this point, test will error if not
    fireEvent.click(button);

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  it("should disable the button when disabled=true is given as a prop", () => {
    const { container } = render(
      <BraintreeBillingAgreementButton
        onApprove={() => Promise.resolve()}
        disabled={true}
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("should disable button when error is present", () => {
    jest.spyOn(console, "error").mockImplementation();
    mockUseBraintreeBillingAgreementSession.mockReturnValue({
      error: new Error("Test error"),
      isPending: false,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreeBillingAgreementButton onApprove={() => Promise.resolve()} />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("should not disable button when error is null", () => {
    mockUseBraintreeBillingAgreementSession.mockReturnValue({
      error: null,
      isPending: false,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreeBillingAgreementButton onApprove={() => Promise.resolve()} />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).not.toHaveAttribute("disabled");
  });

  it("should disable button when isPending is true", () => {
    mockUseBraintreeBillingAgreementSession.mockReturnValue({
      error: null,
      isPending: true,
      handleClick: mockHandleClick,
    });
    const { container } = render(
      <BraintreeBillingAgreementButton onApprove={() => Promise.resolve()} />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("disabled");
  });

  it("should pass type prop to paypal-button", () => {
    const { container } = render(
      <BraintreeBillingAgreementButton
        onApprove={() => Promise.resolve()}
        type="subscribe"
      />,
    );
    const button = container.querySelector("paypal-button");
    expect(button).toHaveAttribute("type", "subscribe");
  });

  it("should pass hook props to useBraintreeBillingAgreementSession", () => {
    const onApprove = () => Promise.resolve();
    render(
      <BraintreeBillingAgreementButton
        onApprove={onApprove}
        billingAgreementDescription="Monthly subscription"
        planType="SUBSCRIPTION"
      />,
    );
    expect(mockUseBraintreeBillingAgreementSession).toHaveBeenCalledWith({
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
    mockUseBraintreeBillingAgreementSession.mockReturnValue({
      error: testError,
      isPending: false,
      handleClick: mockHandleClick,
    });
    render(
      <BraintreeBillingAgreementButton onApprove={() => Promise.resolve()} />,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    consoleErrorSpy.mockRestore();
  });
});
