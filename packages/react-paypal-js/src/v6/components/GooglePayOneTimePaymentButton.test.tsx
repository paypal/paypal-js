/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, waitFor } from "@testing-library/react";

import {
  GooglePayOneTimePaymentButton,
  type GooglePayOneTimePaymentButtonProps,
} from "./GooglePayOneTimePaymentButton";
import { useGooglePayOneTimePaymentSession } from "../hooks/useGooglePayOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { GooglePayConfigFromFindEligibleMethods } from "../types";

jest.mock("../hooks/useGooglePayOneTimePaymentSession", () => ({
  useGooglePayOneTimePaymentSession: jest.fn(),
}));
jest.mock("../hooks/usePayPal", () => ({
  usePayPal: jest.fn(),
}));

let capturedButtonOnClick: (() => void) | null = null;
let capturedButtonOptions: Record<string, unknown> | null = null;
const mockCreateGooglePayButton = jest.fn();

const createMockGooglePayButton = (options: {
  onClick: () => void;
  [key: string]: unknown;
}) => {
  capturedButtonOnClick = options.onClick;
  capturedButtonOptions = options;
  const button = document.createElement("button");
  button.className = "gpay-button";
  button.textContent = "Google Pay";
  return button;
};

describe("GooglePayOneTimePaymentButton", () => {
  const mockHandleClick = jest.fn().mockResolvedValue(undefined);
  const mockHandleCancel = jest.fn();
  const mockHandleDestroy = jest.fn();
  const mockUseGooglePayOneTimePaymentSession =
    useGooglePayOneTimePaymentSession as jest.Mock;
  const mockUsePayPal = usePayPal as jest.Mock;

  const mockGooglePayConfig: GooglePayConfigFromFindEligibleMethods = {
    eligible: true,
    merchantCountry: "US",
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["CRYPTOGRAM_3DS", "PAN_ONLY"],
          supportedNetworks: ["VISA", "MASTERCARD"],
          billingAddressRequired: true,
          assuranceDetailsRequired: true,
          billingAddressParameters: {
            format: "FULL",
          },
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "paypal",
            gatewayMerchantId: "test-merchant-id",
          },
        },
      },
    ],
    merchantInfo: {
      merchantOrigin: "example.com",
      merchantId: "test-merchant-id",
    },
  };

  const defaultProps: GooglePayOneTimePaymentButtonProps = {
    googlePayConfig: mockGooglePayConfig,
    transactionInfo: {
      countryCode: "US",
      currencyCode: "USD",
      totalPriceStatus: "FINAL",
      totalPrice: "100.00",
    },
    createOrder: jest.fn().mockResolvedValue({ orderId: "ORDER-123" }),
    onApprove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedButtonOnClick = null;
    capturedButtonOptions = null;
    mockCreateGooglePayButton.mockImplementation(async (options) =>
      createMockGooglePayButton(options),
    );

    mockUseGooglePayOneTimePaymentSession.mockReturnValue({
      error: null,
      isPending: false,
      paymentsClient: null,
      formattedConfig: null,
      createGooglePayButton: mockCreateGooglePayButton,
      handleClick: mockHandleClick,
      handleCancel: mockHandleCancel,
      handleDestroy: mockHandleDestroy,
    });
    mockUsePayPal.mockReturnValue({
      isHydrated: true,
    });
  });

  it("renders a plain div when not hydrated", () => {
    mockUsePayPal.mockReturnValue({ isHydrated: false });
    const { container } = render(
      <GooglePayOneTimePaymentButton {...defaultProps} />,
    );
    expect(container.querySelector("div")).toBeInTheDocument();
    expect(container.querySelector(".gpay-button")).not.toBeInTheDocument();
    expect(mockCreateGooglePayButton).not.toHaveBeenCalled();
  });

  it("calls createGooglePayButton and mounts the Google Pay button", async () => {
    const { container } = render(
      <GooglePayOneTimePaymentButton {...defaultProps} />,
    );

    await waitFor(() => {
      expect(mockCreateGooglePayButton).toHaveBeenCalled();
      expect(container.querySelector(".gpay-button")).toBeInTheDocument();
    });
  });

  it("does not mount button when createGooglePayButton returns null", async () => {
    mockCreateGooglePayButton.mockResolvedValue(null);

    const { container } = render(
      <GooglePayOneTimePaymentButton {...defaultProps} />,
    );

    await waitFor(() => {
      expect(mockCreateGooglePayButton).toHaveBeenCalled();
    });

    expect(container.querySelector(".gpay-button")).not.toBeInTheDocument();
  });

  it("passes default button options to createGooglePayButton", async () => {
    render(<GooglePayOneTimePaymentButton {...defaultProps} />);

    await waitFor(() => {
      expect(capturedButtonOptions).toMatchObject({
        buttonType: "pay",
        buttonColor: "default",
        buttonSizeMode: "fill",
      });
    });
  });

  it("passes custom button options to createGooglePayButton", async () => {
    render(
      <GooglePayOneTimePaymentButton
        {...defaultProps}
        buttonType="buy"
        buttonColor="black"
        buttonSizeMode="static"
        buttonLocale="fr"
      />,
    );

    await waitFor(() => {
      expect(capturedButtonOptions).toMatchObject({
        buttonType: "buy",
        buttonColor: "black",
        buttonSizeMode: "static",
        buttonLocale: "fr",
      });
    });
  });

  it("calls handleClick when Google Pay button callback fires", async () => {
    render(<GooglePayOneTimePaymentButton {...defaultProps} />);

    await waitFor(() => {
      expect(capturedButtonOnClick).not.toBeNull();
    });

    capturedButtonOnClick!();
    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  it("applies disabled styling when disabled prop is true", () => {
    const { container } = render(
      <GooglePayOneTimePaymentButton {...defaultProps} disabled={true} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.pointerEvents).toBe("none");
    expect(wrapper.style.opacity).toBe("0.5");
    expect(wrapper).toHaveAttribute("aria-disabled", "true");
  });

  it("applies disabled styling when isPending is true", () => {
    mockUseGooglePayOneTimePaymentSession.mockReturnValue({
      error: null,
      isPending: true,
      paymentsClient: null,
      formattedConfig: null,
      createGooglePayButton: mockCreateGooglePayButton,
      handleClick: mockHandleClick,
      handleCancel: mockHandleCancel,
      handleDestroy: mockHandleDestroy,
    });

    const { container } = render(
      <GooglePayOneTimePaymentButton {...defaultProps} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.pointerEvents).toBe("none");
    expect(wrapper.style.opacity).toBe("0.5");
    expect(mockCreateGooglePayButton).not.toHaveBeenCalled();
  });

  it("does not apply disabled styling when hook returns an error", () => {
    const testError = new Error("Test error");
    mockUseGooglePayOneTimePaymentSession.mockReturnValue({
      error: testError,
      isPending: false,
      paymentsClient: null,
      formattedConfig: null,
      createGooglePayButton: mockCreateGooglePayButton,
      handleClick: mockHandleClick,
      handleCancel: mockHandleCancel,
      handleDestroy: mockHandleDestroy,
    });

    const { container } = render(
      <GooglePayOneTimePaymentButton {...defaultProps} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.pointerEvents).toBe("");
    expect(wrapper.style.opacity).toBe("");
  });

  it("passes only hook props to useGooglePayOneTimePaymentSession", () => {
    render(
      <GooglePayOneTimePaymentButton
        {...defaultProps}
        buttonType="buy"
        buttonColor="black"
        buttonSizeMode="static"
        buttonLocale="fr"
        disabled={true}
      />,
    );

    expect(mockUseGooglePayOneTimePaymentSession).toHaveBeenCalledWith(
      defaultProps,
    );
  });

  it("calls handleDestroy on unmount", () => {
    const { unmount } = render(
      <GooglePayOneTimePaymentButton {...defaultProps} />,
    );
    unmount();
    expect(mockHandleDestroy).toHaveBeenCalled();
  });
});
