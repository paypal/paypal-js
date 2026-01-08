import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { PayPalSavePaymentButton } from "./PayPalSavePaymentButton";
import { usePayPalSavePaymentSession } from "../hooks/usePayPalSavePaymentSession";
import { isServer } from "../utils";

jest.mock("../hooks/usePayPalSavePaymentSession", () => ({
    usePayPalSavePaymentSession: jest.fn(),
}));
jest.mock("../utils", () => ({
    isServer: jest.fn().mockReturnValue(false),
}));

describe("PayPalSavePaymentButton", () => {
    const mockHandleClick = jest.fn();
    const mockUsePayPalSavePaymentSession =
        usePayPalSavePaymentSession as jest.Mock;
    const mockIsServer = isServer as jest.Mock;

    const defaultProps = {
        vaultSetupToken: "test-vault-token",
        onApprove: () => Promise.resolve(),
        presentationMode: "auto" as const,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePayPalSavePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        mockIsServer.mockReturnValue(false);
    });

    it("should render paypal-button when not on server side", () => {
        const { container } = render(
            <PayPalSavePaymentButton {...defaultProps} />,
        );
        expect(container.querySelector("paypal-button")).toBeInTheDocument();
    });

    it("should return div when on server side", () => {
        mockIsServer.mockReturnValue(true);
        const { container } = render(
            <PayPalSavePaymentButton {...defaultProps} />,
        );
        expect(
            container.querySelector("paypal-button"),
        ).not.toBeInTheDocument();
    });

    it("should call handleClick when button is clicked", () => {
        const { container } = render(
            <PayPalSavePaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("paypal-button");

        // @ts-expect-error button should be defined at this point, test will error if not
        fireEvent.click(button);

        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it("should disable the button when disabled=true is given as a prop", () => {
        const { container } = render(
            <PayPalSavePaymentButton {...defaultProps} disabled={true} />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should disable button when error is present", () => {
        jest.spyOn(console, "error").mockImplementation();
        mockUsePayPalSavePaymentSession.mockReturnValue({
            error: new Error("Test error"),
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalSavePaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should not disable button when error is null", () => {
        mockUsePayPalSavePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalSavePaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).not.toHaveAttribute("disabled");
    });

    it("should return null when isPending is true", () => {
        mockUsePayPalSavePaymentSession.mockReturnValue({
            error: null,
            isPending: true,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalSavePaymentButton {...defaultProps} />,
        );
        expect(
            container.querySelector("paypal-button"),
        ).not.toBeInTheDocument();
        expect(container.firstChild).toBeNull();
    });

    it("should pass type prop to paypal-button", () => {
        const { container } = render(
            <PayPalSavePaymentButton {...defaultProps} type="subscribe" />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("type", "subscribe");
    });

    it("should pass hook props to usePayPalSavePaymentSession", () => {
        const hookProps = {
            vaultSetupToken: "test-vault-token",
            onApprove: () => Promise.resolve(),
            presentationMode: "auto" as const,
        };
        render(<PayPalSavePaymentButton {...hookProps} />);
        expect(mockUsePayPalSavePaymentSession).toHaveBeenCalledWith(hookProps);
    });

    it("should log error to console when an error from the hook is present", () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();
        const testError = new Error("Test error");
        mockUsePayPalSavePaymentSession.mockReturnValue({
            error: testError,
            isPending: false,
            handleClick: mockHandleClick,
        });
        render(<PayPalSavePaymentButton {...defaultProps} />);
        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
        consoleErrorSpy.mockRestore();
    });
});
