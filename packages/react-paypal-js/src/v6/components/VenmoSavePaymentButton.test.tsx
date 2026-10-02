import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { VenmoSavePaymentButton } from "./VenmoSavePaymentButton";
import { useVenmoSavePaymentSession } from "../hooks/useVenmoSavePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

jest.mock("../hooks/useVenmoSavePaymentSession", () => ({
  useVenmoSavePaymentSession: jest.fn(),
}));
jest.mock("../hooks/usePayPal", () => ({
  usePayPal: jest.fn(),
}));

describe("VenmoSavePaymentButton", () => {
  const mockHandleClick = jest.fn();
  const mockUseVenmoSavePaymentSession =
    useVenmoSavePaymentSession as jest.Mock;
  const mockUsePayPal = usePayPal as jest.Mock;

  const defaultProps = {
    vaultSetupToken: "test-vault-token",
    onApprove: () => Promise.resolve(),
    presentationMode: "auto" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVenmoSavePaymentSession.mockReturnValue({
      error: null,
      isPending: false,
      handleClick: mockHandleClick,
    });
    mockUsePayPal.mockReturnValue({
      isHydrated: true,
    });
  });

  it("should render venmo-button when hydrated", () => {
    const { container } = render(<VenmoSavePaymentButton {...defaultProps} />);
    expect(container.querySelector("venmo-button")).toBeInTheDocument();
  });

  it("should render a div when not hydrated", () => {
    mockUsePayPal.mockReturnValue({
      isHydrated: false,
    });
    const { container } = render(<VenmoSavePaymentButton {...defaultProps} />);
    expect(container.querySelector("venmo-button")).not.toBeInTheDocument();
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("should call handleClick when button is clicked", () => {
    const { container } = render(<VenmoSavePaymentButton {...defaultProps} />);
    const button = container.querySelector("venmo-button");

    // @ts-expect-error button should be defined at this point, test will error if not
    fireEvent.click(button);

    expect(mockHandleClick).toHaveBeenCalledTimes(1);
  });

  it("should disable the button when disabled=true is given as a prop", () => {
    const { container } = render(
      <VenmoSavePaymentButton {...defaultProps} disabled={true} />,
    );
    const button = container.querySelector("venmo-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("should disable button when error is present", () => {
    jest.spyOn(console, "error").mockImplementation();
    mockUseVenmoSavePaymentSession.mockReturnValue({
      error: new Error("Test error"),
      isPending: false,
      handleClick: mockHandleClick,
    });
    const { container } = render(<VenmoSavePaymentButton {...defaultProps} />);
    const button = container.querySelector("venmo-button");
    expect(button).toHaveAttribute("disabled");
  });

  it("should not disable button when error is null", () => {
    mockUseVenmoSavePaymentSession.mockReturnValue({
      error: null,
      isPending: false,
      handleClick: mockHandleClick,
    });
    const { container } = render(<VenmoSavePaymentButton {...defaultProps} />);
    const button = container.querySelector("venmo-button");
    expect(button).not.toHaveAttribute("disabled");
  });

  it("should disable button when isPending is true", () => {
    mockUseVenmoSavePaymentSession.mockReturnValue({
      error: null,
      isPending: true,
      handleClick: mockHandleClick,
    });
    const { container } = render(<VenmoSavePaymentButton {...defaultProps} />);
    const button = container.querySelector("venmo-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("disabled");
  });

  it("should pass type prop to venmo-button", () => {
    const { container } = render(
      <VenmoSavePaymentButton {...defaultProps} type="subscribe" />,
    );
    const button = container.querySelector("venmo-button");
    expect(button).toHaveAttribute("type", "subscribe");
  });

  it("should pass hook props to useVenmoSavePaymentSession", () => {
    const hookProps = {
      vaultSetupToken: "test-vault-token",
      onApprove: () => Promise.resolve(),
      presentationMode: "auto" as const,
    };
    render(<VenmoSavePaymentButton {...hookProps} />);
    expect(mockUseVenmoSavePaymentSession).toHaveBeenCalledWith(hookProps);
  });

  it("should log error to console when an error from the hook is present", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const testError = new Error("Test error");
    mockUseVenmoSavePaymentSession.mockReturnValue({
      error: testError,
      isPending: false,
      handleClick: mockHandleClick,
    });
    render(<VenmoSavePaymentButton {...defaultProps} />);
    expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
    consoleErrorSpy.mockRestore();
  });
});
