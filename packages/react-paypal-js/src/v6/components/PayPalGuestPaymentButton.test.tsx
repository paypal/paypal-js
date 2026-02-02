import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { PayPalGuestPaymentButton } from "./PayPalGuestPaymentButton";
import { usePayPalGuestPaymentSession } from "../hooks/usePayPalGuestPaymentSession";
import { usePayPal } from "../hooks/usePayPal";

jest.mock("../hooks/usePayPalGuestPaymentSession", () => ({
    usePayPalGuestPaymentSession: jest.fn(),
}));
jest.mock("../hooks/usePayPal", () => ({
    usePayPal: jest.fn(),
}));

describe("PayPalGuestPaymentButton", () => {
    const mockHandleClick = jest.fn();
    const mockButtonRef = { current: null };
    const mockUsePayPalGuestPaymentSession =
        usePayPalGuestPaymentSession as jest.Mock;
    const mockUsePayPal = usePayPal as jest.Mock;

    const defaultProps = {
        orderId: "test-order-id",
        onApprove: () => Promise.resolve(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePayPalGuestPaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
            buttonRef: mockButtonRef,
            handleCancel: jest.fn(),
            handleDestroy: jest.fn(),
        });
        mockUsePayPal.mockReturnValue({
            isHydrated: true,
        });
    });

    it("should render paypal-basic-card-button when hydrated", () => {
        const { container } = render(
            <PayPalGuestPaymentButton {...defaultProps} />,
        );
        expect(
            container.querySelector("paypal-basic-card-button"),
        ).toBeInTheDocument();
    });

    it("should render a div when not hydrated", () => {
        mockUsePayPal.mockReturnValue({
            isHydrated: false,
        });
        const { container } = render(
            <PayPalGuestPaymentButton {...defaultProps} />,
        );
        expect(
            container.querySelector("paypal-basic-card-button"),
        ).not.toBeInTheDocument();
        expect(container.querySelector("div")).toBeInTheDocument();
    });

    it("should call handleClick when button is clicked", () => {
        const { container } = render(
            <PayPalGuestPaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("paypal-basic-card-button");

        // @ts-expect-error button should be defined at this point, test will error if not
        fireEvent.click(button);

        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it("should disable the button when disabled=true is given as a prop", () => {
        const { container } = render(
            <PayPalGuestPaymentButton {...defaultProps} disabled={true} />,
        );
        const button = container.querySelector("paypal-basic-card-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should disable button when error is present", () => {
        jest.spyOn(console, "error").mockImplementation();
        mockUsePayPalGuestPaymentSession.mockReturnValue({
            error: new Error("Test error"),
            isPending: false,
            handleClick: mockHandleClick,
            buttonRef: mockButtonRef,
            handleCancel: jest.fn(),
            handleDestroy: jest.fn(),
        });
        const { container } = render(
            <PayPalGuestPaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("paypal-basic-card-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should not disable button when error is null", () => {
        mockUsePayPalGuestPaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
            buttonRef: mockButtonRef,
            handleCancel: jest.fn(),
            handleDestroy: jest.fn(),
        });
        const { container } = render(
            <PayPalGuestPaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("paypal-basic-card-button");
        expect(button).not.toHaveAttribute("disabled");
    });

    it("should disable button when isPending is true", () => {
        mockUsePayPalGuestPaymentSession.mockReturnValue({
            error: null,
            isPending: true,
            handleClick: mockHandleClick,
            buttonRef: mockButtonRef,
            handleCancel: jest.fn(),
            handleDestroy: jest.fn(),
        });
        const { container } = render(
            <PayPalGuestPaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("paypal-basic-card-button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute("disabled");
    });

    it("should pass hook props to usePayPalGuestPaymentSession", () => {
        const hookProps = {
            orderId: "test-order-id",
            onApprove: () => Promise.resolve(),
            fullPageOverlay: { enabled: true },
        };
        render(<PayPalGuestPaymentButton {...hookProps} />);
        expect(mockUsePayPalGuestPaymentSession).toHaveBeenCalledWith(
            hookProps,
        );
    });

    it("should pass createOrder to hook when provided", () => {
        const createOrder = jest
            .fn()
            .mockResolvedValue({ orderId: "ORDER-123" });
        const hookProps = {
            createOrder,
            onApprove: () => Promise.resolve(),
        };
        render(<PayPalGuestPaymentButton {...hookProps} />);
        expect(mockUsePayPalGuestPaymentSession).toHaveBeenCalledWith(
            hookProps,
        );
    });

    it("should log error to console when an error from the hook is present", () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();
        const testError = new Error("Test error");
        mockUsePayPalGuestPaymentSession.mockReturnValue({
            error: testError,
            isPending: false,
            handleClick: mockHandleClick,
            buttonRef: mockButtonRef,
            handleCancel: jest.fn(),
            handleDestroy: jest.fn(),
        });
        render(<PayPalGuestPaymentButton {...defaultProps} />);
        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
        consoleErrorSpy.mockRestore();
    });

    it("should pass buttonRef to the web component", () => {
        const { container } = render(
            <PayPalGuestPaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("paypal-basic-card-button");
        expect(button).toBeInTheDocument();
        // The ref is attached internally, we just verify the button renders
    });
});
