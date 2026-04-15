import React from "react";
import { render, fireEvent } from "@testing-library/react";

import {
    ApplePayOneTimePaymentButton,
    type ApplePayOneTimePaymentButtonProps,
} from "./ApplePayOneTimePaymentButton";
import { useApplePayOneTimePaymentSession } from "../hooks/useApplePayOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

import type { ApplePayConfig } from "../types";

jest.mock("../hooks/useApplePayOneTimePaymentSession", () => ({
    useApplePayOneTimePaymentSession: jest.fn(),
}));
jest.mock("../hooks/usePayPal", () => ({
    usePayPal: jest.fn(),
}));

describe("ApplePayOneTimePaymentButton", () => {
    const mockHandleClick = jest.fn();
    const mockHandleCancel = jest.fn();
    const mockHandleDestroy = jest.fn();
    const mockUseApplePayOneTimePaymentSession =
        useApplePayOneTimePaymentSession as jest.Mock;
    const mockUsePayPal = usePayPal as jest.Mock;

    const mockApplePayConfig: ApplePayConfig = {
        merchantCapabilities: ["supports3DS"],
        supportedNetworks: ["visa", "masterCard"],
        isEligible: true,
        tokenNotificationURL: "https://example.com/notify",
    };

    const defaultProps: ApplePayOneTimePaymentButtonProps = {
        applePayConfig: mockApplePayConfig,
        paymentRequest: {
            countryCode: "US",
            currencyCode: "USD",
            total: {
                label: "Test Store",
                amount: "100.00",
                type: "final",
            },
        },
        applePaySessionVersion: 4,
        createOrder: jest.fn().mockResolvedValue({ orderId: "ORDER-123" }),
        onApprove: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockHandleClick.mockResolvedValue(undefined);
        mockUseApplePayOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
            handleCancel: mockHandleCancel,
            handleDestroy: mockHandleDestroy,
        });
        mockUsePayPal.mockReturnValue({
            isHydrated: true,
        });
    });

    it("should render container div with apple-pay-button when hydrated", () => {
        const { container } = render(
            <ApplePayOneTimePaymentButton {...defaultProps} />,
        );
        const applePayButton = container.querySelector("apple-pay-button");
        expect(applePayButton).toBeInTheDocument();
    });

    it("should render a plain div when not hydrated", () => {
        mockUsePayPal.mockReturnValue({
            isHydrated: false,
        });
        const { container } = render(
            <ApplePayOneTimePaymentButton {...defaultProps} />,
        );
        expect(
            container.querySelector("apple-pay-button"),
        ).not.toBeInTheDocument();
        expect(container.querySelector("div")).toBeInTheDocument();
    });

    it("should call handleClick when button is clicked", () => {
        const { container } = render(
            <ApplePayOneTimePaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("apple-pay-button");
        expect(button).toBeInTheDocument();

        fireEvent.click(button!);

        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it("should set disabled attribute when disabled prop is true", () => {
        const { container } = render(
            <ApplePayOneTimePaymentButton {...defaultProps} disabled={true} />,
        );
        const button = container.querySelector("apple-pay-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should not set disabled attribute when error is present (allows retry)", () => {
        jest.spyOn(console, "error").mockImplementation();
        mockUseApplePayOneTimePaymentSession.mockReturnValue({
            error: new Error("Test error"),
            isPending: false,
            handleClick: mockHandleClick,
            handleCancel: mockHandleCancel,
            handleDestroy: mockHandleDestroy,
        });
        const { container } = render(
            <ApplePayOneTimePaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("apple-pay-button");
        expect(button).not.toHaveAttribute("disabled");
    });

    it("should set disabled attribute when isPending is true", () => {
        mockUseApplePayOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: true,
            handleClick: mockHandleClick,
            handleCancel: mockHandleCancel,
            handleDestroy: mockHandleDestroy,
        });
        const { container } = render(
            <ApplePayOneTimePaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("apple-pay-button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute("disabled");
    });

    it("should not set disabled attribute when state is normal", () => {
        const { container } = render(
            <ApplePayOneTimePaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("apple-pay-button");
        expect(button).not.toHaveAttribute("disabled");
    });

    it("should set default button attributes", () => {
        const { container } = render(
            <ApplePayOneTimePaymentButton {...defaultProps} />,
        );
        const button = container.querySelector("apple-pay-button");
        expect(button).toHaveAttribute("buttonstyle", "black");
        expect(button).toHaveAttribute("type", "pay");
        expect(button).toHaveAttribute("locale", "en");
    });

    it("should set custom button attributes", () => {
        const { container } = render(
            <ApplePayOneTimePaymentButton
                {...defaultProps}
                buttonstyle="white"
                type="buy"
                locale="fr"
            />,
        );
        const button = container.querySelector("apple-pay-button");
        expect(button).toHaveAttribute("buttonstyle", "white");
        expect(button).toHaveAttribute("type", "buy");
        expect(button).toHaveAttribute("locale", "fr");
    });

    it("should apply className to container div", () => {
        const { container } = render(
            <ApplePayOneTimePaymentButton
                {...defaultProps}
                className="custom-class"
            />,
        );
        const wrapper = container.firstElementChild;
        expect(wrapper).toHaveClass("custom-class");
    });

    it("should pass hook props to useApplePayOneTimePaymentSession", () => {
        render(<ApplePayOneTimePaymentButton {...defaultProps} />);
        expect(mockUseApplePayOneTimePaymentSession).toHaveBeenCalledWith(
            defaultProps,
        );
    });

    it("should strip button-specific props before passing to hook", () => {
        render(
            <ApplePayOneTimePaymentButton
                {...defaultProps}
                buttonstyle="white"
                type="buy"
                locale="fr"
                disabled={true}
                className="test"
            />,
        );
        // Hook should receive only hook-relevant props
        expect(mockUseApplePayOneTimePaymentSession).toHaveBeenCalledWith(
            defaultProps,
        );
    });

    it("should log error to console when hook returns an error", () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();
        const testError = new Error("Test error");
        mockUseApplePayOneTimePaymentSession.mockReturnValue({
            error: testError,
            isPending: false,
            handleClick: mockHandleClick,
            handleCancel: mockHandleCancel,
            handleDestroy: mockHandleDestroy,
        });
        render(<ApplePayOneTimePaymentButton {...defaultProps} />);
        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
        consoleErrorSpy.mockRestore();
    });

    it("should call handleDestroy on unmount", () => {
        const { unmount } = render(
            <ApplePayOneTimePaymentButton {...defaultProps} />,
        );
        unmount();
        expect(mockHandleDestroy).toHaveBeenCalled();
    });

    it("should remove apple-pay-button from DOM on unmount", () => {
        const { container, unmount } = render(
            <ApplePayOneTimePaymentButton {...defaultProps} />,
        );
        expect(container.querySelector("apple-pay-button")).toBeInTheDocument();

        unmount();

        expect(
            container.querySelector("apple-pay-button"),
        ).not.toBeInTheDocument();
    });

    it("should update button attributes when buttonstyle changes", () => {
        const { container, rerender } = render(
            <ApplePayOneTimePaymentButton
                {...defaultProps}
                buttonstyle="black"
            />,
        );
        expect(container.querySelector("apple-pay-button")).toHaveAttribute(
            "buttonstyle",
            "black",
        );

        rerender(
            <ApplePayOneTimePaymentButton
                {...defaultProps}
                buttonstyle="white"
            />,
        );
        expect(container.querySelector("apple-pay-button")).toHaveAttribute(
            "buttonstyle",
            "white",
        );
    });
});
