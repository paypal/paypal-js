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
            handleClick: mockHandleClick,
        });
    });

    it.only("should render paypal-button when not on server side", () => {
        const { container } = render(<PayPalOneTimePaymentButton />);
        expect(container.querySelector("paypal-button")).toBeInTheDocument();
    });

    it("should return null when on server side", () => {
        mockIsServer.mockReturnValue(true);
        const { container } = render(<PayPalOneTimePaymentButton />);
        expect(
            container.querySelector("paypal-button"),
        ).not.toBeInTheDocument();
    });

    it("should call handleClick when button is clicked", () => {
        const { container } = render(<PayPalOneTimePaymentButton />);
        const button = container.querySelector("paypal-button");
        fireEvent.click(button!);
        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it("should disable button when error is present", () => {
        mockUsePayPalOneTimePaymentSession.mockReturnValue({
            error: new Error("Test error"),
            handleClick: mockHandleClick,
        });
        const { container } = render(<PayPalOneTimePaymentButton />);
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should not disable button when error is null", () => {
        const { container } = render(<PayPalOneTimePaymentButton />);
        const button = container.querySelector("paypal-button");
        expect(button).not.toHaveAttribute("disabled");
    });

    it("should pass type prop to paypal-button", () => {
        const { container } = render(
            <PayPalOneTimePaymentButton type="submit" />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("type", "submit");
    });

    it("should pass hook props to usePayPalOneTimePaymentSession", () => {
        const hookProps = {
            clientToken: "test-token",
            amount: "10.00",
            currency: "USD",
        };
        render(<PayPalOneTimePaymentButton {...hookProps} />);
        expect(mockUsePayPalOneTimePaymentSession).toHaveBeenCalledWith(
            hookProps,
        );
    });

    it("should log error to console when error is present", () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();
        const testError = new Error("Test error");
        mockUsePayPalOneTimePaymentSession.mockReturnValue({
            error: testError,
            handleClick: mockHandleClick,
        });
        render(<PayPalOneTimePaymentButton />);
        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
        consoleErrorSpy.mockRestore();
    });
});
