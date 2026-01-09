import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { VenmoOneTimePaymentButton } from "./VenmoOneTimePaymentButton";
import { useVenmoOneTimePaymentSession } from "../hooks/useVenmoOneTimePaymentSession";
import { isServer } from "../utils";

jest.mock("../hooks/useVenmoOneTimePaymentSession", () => ({
    useVenmoOneTimePaymentSession: jest.fn(),
}));
jest.mock("../utils", () => ({
    isServer: jest.fn().mockReturnValue(false),
}));

describe("VenmoOneTimePaymentButton", () => {
    const mockHandleClick = jest.fn();
    const mockUseVenmoOneTimePaymentSession =
        useVenmoOneTimePaymentSession as jest.Mock;
    const mockIsServer = isServer as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseVenmoOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        mockIsServer.mockReturnValue(false);
    });

    it("should render venmo-button when not on server side", () => {
        const { container } = render(
            <VenmoOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(container.querySelector("venmo-button")).toBeInTheDocument();
    });

    it("should render a div when on server side", () => {
        mockIsServer.mockReturnValue(true);
        const { container } = render(
            <VenmoOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(container.querySelector("venmo-button")).not.toBeInTheDocument();
        expect(container.querySelector("div")).toBeInTheDocument();
    });

    it("should call handleClick when button is clicked", () => {
        const { container } = render(
            <VenmoOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("venmo-button");

        // @ts-expect-error button should be defined at this point, test will error if not
        fireEvent.click(button);

        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it("should disable the button when disabled=true is given as a prop", () => {
        const { container } = render(
            <VenmoOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
                disabled={true}
            />,
        );
        const button = container.querySelector("venmo-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should disable button when error is present", () => {
        jest.spyOn(console, "error").mockImplementation();
        mockUseVenmoOneTimePaymentSession.mockReturnValue({
            error: new Error("Test error"),
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <VenmoOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("venmo-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should not disable button when error is null", () => {
        mockUseVenmoOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <VenmoOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("venmo-button");
        expect(button).not.toHaveAttribute("disabled");
    });

    it("should disable button when isPending is true", () => {
        mockUseVenmoOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: true,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <VenmoOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("venmo-button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute("disabled");
    });

    it("should pass type prop to venmo-button", () => {
        const { container } = render(
            <VenmoOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
                type="subscribe"
            />,
        );
        const button = container.querySelector("venmo-button");
        expect(button).toHaveAttribute("type", "subscribe");
    });

    it("should pass hook props to useVenmoOneTimePaymentSession", () => {
        const hookProps = {
            clientToken: "test-token",
            amount: "10.00",
            currency: "USD",
            onApprove: () => Promise.resolve(),
            orderId: "123",
            presentationMode: "auto" as const,
        };
        render(<VenmoOneTimePaymentButton {...hookProps} />);
        expect(mockUseVenmoOneTimePaymentSession).toHaveBeenCalledWith(
            hookProps,
        );
    });

    it("should log error to console when an error from the hook is present", () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();
        const testError = new Error("Test error");
        mockUseVenmoOneTimePaymentSession.mockReturnValue({
            error: testError,
            isPending: false,
            handleClick: mockHandleClick,
        });
        render(
            <VenmoOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
        consoleErrorSpy.mockRestore();
    });
});
