import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { PayPalOneTimePaymentButton } from "./PayPalOneTimePaymentButton";
import { usePayPalOneTimePaymentSession } from "../hooks/usePayPalOneTimePaymentSession";
import { isServer } from "../utils";

jest.mock("../hooks/usePayPalOneTimePaymentSession", () => ({
    usePayPalOneTimePaymentSession: jest.fn(),
}));
jest.mock("../utils", () => ({
    isServer: jest.fn().mockReturnValue(false),
}));

describe("PayPalOneTimePaymentButton", () => {
    const mockHandleClick = jest.fn();
    const mockUsePayPalOneTimePaymentSession =
        usePayPalOneTimePaymentSession as jest.Mock;
    const mockIsServer = isServer as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePayPalOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        mockIsServer.mockReturnValue(false);
    });

    it("should render paypal-button when not on server side", () => {
        const { container } = render(
            <PayPalOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(container.querySelector("paypal-button")).toBeInTheDocument();
    });

    it("should return null when on server side", () => {
        mockIsServer.mockReturnValue(true);
        const { container } = render(
            <PayPalOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(
            container.querySelector("paypal-button"),
        ).not.toBeInTheDocument();
    });

    it("should call handleClick when button is clicked", () => {
        const { container } = render(
            <PayPalOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-button");

        // @ts-expect-error button should be defined at this point, test will error if not
        fireEvent.click(button);

        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it("should disable the button when disabled=true is given as a prop", () => {
        const { container } = render(
            <PayPalOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
                disabled={true}
            />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should disable button when error is present", () => {
        jest.spyOn(console, "error").mockImplementation();
        mockUsePayPalOneTimePaymentSession.mockReturnValue({
            error: new Error("Test error"),
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should not disable button when error is null", () => {
        mockUsePayPalOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).not.toHaveAttribute("disabled");
    });

    it("should return null when isPending is true", () => {
        mockUsePayPalOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: true,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(
            container.querySelector("paypal-button"),
        ).not.toBeInTheDocument();
        expect(container.firstChild).toBeNull();
    });

    it("should pass type prop to paypal-button", () => {
        const { container } = render(
            <PayPalOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
                type="subscribe"
            />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("type", "subscribe");
    });

    it("should pass hook props to usePayPalOneTimePaymentSession", () => {
        const hookProps = {
            clientToken: "test-token",
            amount: "10.00",
            currency: "USD",
            onApprove: () => Promise.resolve(),
            orderId: "123",
            presentationMode: "auto" as const,
        };
        render(<PayPalOneTimePaymentButton {...hookProps} />);
        expect(mockUsePayPalOneTimePaymentSession).toHaveBeenCalledWith(
            hookProps,
        );
    });

    it("should log error to console when an error from the hook is present", () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();
        const testError = new Error("Test error");
        mockUsePayPalOneTimePaymentSession.mockReturnValue({
            error: testError,
            isPending: false,
            handleClick: mockHandleClick,
        });
        render(
            <PayPalOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
        consoleErrorSpy.mockRestore();
    });
});
