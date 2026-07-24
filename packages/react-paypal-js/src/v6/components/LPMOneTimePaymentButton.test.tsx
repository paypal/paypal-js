import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { LPMOneTimePaymentButton } from "./LPMOneTimePaymentButton";
import { useLPMOneTimePaymentSession } from "../hooks/useLPMOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { LPMOneTimePaymentButtonProps } from "./LPMOneTimePaymentButton";

jest.mock("../hooks/useLPMOneTimePaymentSession", () => ({
  useLPMOneTimePaymentSession: jest.fn(),
}));
jest.mock("../hooks/usePayPal", () => ({
  usePayPal: jest.fn(),
}));

const mockUseLPMOneTimePaymentSession =
  useLPMOneTimePaymentSession as jest.Mock;
const mockUsePayPal = usePayPal as jest.Mock;

const mockHandleClick = jest.fn();

const defaultProps: LPMOneTimePaymentButtonProps = {
  lpm: "ideal",
  presentationMode: "popup",
  orderId: "test-order-id",
  onApprove: jest.fn().mockResolvedValue(undefined),
};

describe("LPMOneTimePaymentButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLPMOneTimePaymentSession.mockReturnValue({
      error: null,
      isPending: false,
      handleClick: mockHandleClick,
    });
    mockUsePayPal.mockReturnValue({
      isHydrated: true,
    });
  });

  describe("rendering", () => {
    test.each([
      { lpm: "ideal" as const, expectedTag: "ideal-button" },
      { lpm: "bancontact" as const, expectedTag: "bancontact-button" },
      { lpm: "eps" as const, expectedTag: "eps-button" },
      { lpm: "blik" as const, expectedTag: "blik-button" },
    ])("should render $expectedTag for lpm=$lpm", ({ lpm, expectedTag }) => {
      const { container } = render(
        <LPMOneTimePaymentButton {...defaultProps} lpm={lpm} />,
      );
      expect(container.querySelector(expectedTag)).toBeInTheDocument();
    });

    test("should render div placeholder when not hydrated", () => {
      mockUsePayPal.mockReturnValue({ isHydrated: false });

      const { container } = render(
        <LPMOneTimePaymentButton {...defaultProps} />,
      );

      expect(container.querySelector("ideal-button")).not.toBeInTheDocument();
      expect(container.querySelector("div")).toBeInTheDocument();
    });
  });

  describe("user interaction", () => {
    test("should call handleClick when button is clicked", () => {
      const { container } = render(
        <LPMOneTimePaymentButton {...defaultProps} />,
      );

      const button = container.querySelector("ideal-button");
      fireEvent.click(button!);
      expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("disabled state", () => {
    test("should disable button when disabled prop is true", () => {
      const { container } = render(
        <LPMOneTimePaymentButton {...defaultProps} disabled={true} />,
      );

      expect(container.querySelector("ideal-button")).toHaveAttribute(
        "disabled",
      );
    });

    test("should disable button when isPending is true", () => {
      mockUseLPMOneTimePaymentSession.mockReturnValue({
        error: null,
        isPending: true,
        handleClick: mockHandleClick,
      });

      const { container } = render(
        <LPMOneTimePaymentButton {...defaultProps} />,
      );

      expect(container.querySelector("ideal-button")).toHaveAttribute(
        "disabled",
      );
    });

    test("should disable button when error is present", () => {
      mockUseLPMOneTimePaymentSession.mockReturnValue({
        error: new Error("Test error"),
        isPending: false,
        handleClick: mockHandleClick,
      });

      const { container } = render(
        <LPMOneTimePaymentButton {...defaultProps} />,
      );

      expect(container.querySelector("ideal-button")).toHaveAttribute(
        "disabled",
      );
    });
  });

  describe("error handling", () => {
    test("should disable button when error is present", () => {
      const testError = new Error("Test error");

      mockUseLPMOneTimePaymentSession.mockReturnValue({
        error: testError,
        isPending: false,
        handleClick: mockHandleClick,
        handleCancel: jest.fn(),
        handleDestroy: jest.fn(),
        session: null,
        handleValidate: jest.fn().mockResolvedValue(true),
      });

      render(<LPMOneTimePaymentButton {...defaultProps} />);

      // Error state disables the button; console.error is the merchant's responsibility
      const button = document.querySelector("ideal-button");
      expect(button).toHaveAttribute("disabled");
    });
  });

  describe("hook props forwarding", () => {
    test("should pass lpm and hook props to useLPMOneTimePaymentSession", () => {
      const hookProps = {
        lpm: "bancontact" as const,
        presentationMode: "popup" as const,
        orderId: "my-order",
        onApprove: jest.fn().mockResolvedValue(undefined),
        onCancel: jest.fn(),
      };

      render(<LPMOneTimePaymentButton {...hookProps} />);

      expect(mockUseLPMOneTimePaymentSession).toHaveBeenCalledWith(
        expect.objectContaining({
          lpm: "bancontact",
          presentationMode: "popup",
          orderId: "my-order",
        }),
      );
    });
  });

  describe("fieldContainerStyle (M3)", () => {
    test("applies custom fieldContainerStyle to field containers", () => {
      mockUseLPMOneTimePaymentSession.mockReturnValue({
        error: null,
        isPending: false,
        handleClick: mockHandleClick,
        session: {
          createPaymentFields: jest
            .fn()
            .mockReturnValue(document.createElement("div")),
        },
        handleValidate: jest.fn().mockResolvedValue(true),
      });

      const customStyle = { marginBottom: 16, border: "1px solid red" };
      const { container } = render(
        <LPMOneTimePaymentButton
          {...defaultProps}
          fieldContainerStyle={customStyle}
        />,
      );

      // blik has fields: ["name", "email"] — use ideal (fields: ["name"])
      const fieldDiv = container.querySelector(
        '[data-testid="ideal-name-field"]',
      );
      expect(fieldDiv).not.toBeNull();
      expect((fieldDiv as HTMLElement).style.marginBottom).toBe("16px");
    });

    test("defaults to marginBottom:8 when fieldContainerStyle is not provided", () => {
      const { container } = render(
        <LPMOneTimePaymentButton {...defaultProps} />,
      );

      const fieldDiv = container.querySelector(
        '[data-testid="ideal-name-field"]',
      );
      expect(fieldDiv).not.toBeNull();
      expect((fieldDiv as HTMLElement).style.marginBottom).toBe("8px");
    });
  });
});
