import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { PayPalSubscriptionButton } from "./PayPalSubscriptionButton";
import { usePayPalSubscriptionPaymentSession } from "../hooks/usePayPalSubscriptionPaymentSession";
import { usePayPal } from "../hooks/usePayPal";

jest.mock("../hooks/usePayPalSubscriptionPaymentSession", () => ({
    usePayPalSubscriptionPaymentSession: jest.fn(),
}));
jest.mock("../hooks/usePayPal", () => ({
    usePayPal: jest.fn(),
}));

describe("PayPalSubscriptionButton", () => {
    const mockHandleClick = jest.fn();
    const mockUsePayPalSubscriptionPaymentSession =
        usePayPalSubscriptionPaymentSession as jest.Mock;
    const mockUsePayPal = usePayPal as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePayPalSubscriptionPaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        mockUsePayPal.mockReturnValue({
            isHydrated: true,
        });
    });

    it("should render paypal-button when hydrated", () => {
        const { container } = render(
            <PayPalSubscriptionButton
                onApprove={() => Promise.resolve()}
                createSubscription={() =>
                    Promise.resolve({ subscriptionId: "SUB-123" })
                }
                presentationMode="auto"
            />,
        );
        expect(container.querySelector("paypal-button")).toBeInTheDocument();
    });

    it("should render a div when not hydrated", () => {
        mockUsePayPal.mockReturnValue({
            isHydrated: false,
        });
        const { container } = render(
            <PayPalSubscriptionButton
                onApprove={() => Promise.resolve()}
                createSubscription={() =>
                    Promise.resolve({ subscriptionId: "SUB-123" })
                }
                presentationMode="auto"
            />,
        );
        expect(
            container.querySelector("paypal-button"),
        ).not.toBeInTheDocument();
        expect(container.querySelector("div")).toBeInTheDocument();
    });

    it("should call handleClick when button is clicked", () => {
        const { container } = render(
            <PayPalSubscriptionButton
                onApprove={() => Promise.resolve()}
                createSubscription={() =>
                    Promise.resolve({ subscriptionId: "SUB-123" })
                }
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
            <PayPalSubscriptionButton
                onApprove={() => Promise.resolve()}
                createSubscription={() =>
                    Promise.resolve({ subscriptionId: "SUB-123" })
                }
                presentationMode="auto"
                disabled={true}
            />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should disable button when error is present", () => {
        jest.spyOn(console, "error").mockImplementation();
        mockUsePayPalSubscriptionPaymentSession.mockReturnValue({
            error: new Error("Test error"),
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalSubscriptionButton
                onApprove={() => Promise.resolve()}
                createSubscription={() =>
                    Promise.resolve({ subscriptionId: "SUB-123" })
                }
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should not disable button when error is null", () => {
        mockUsePayPalSubscriptionPaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalSubscriptionButton
                onApprove={() => Promise.resolve()}
                createSubscription={() =>
                    Promise.resolve({ subscriptionId: "SUB-123" })
                }
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).not.toHaveAttribute("disabled");
    });

    it("should disable button when isPending is true", () => {
        mockUsePayPalSubscriptionPaymentSession.mockReturnValue({
            error: null,
            isPending: true,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalSubscriptionButton
                onApprove={() => Promise.resolve()}
                createSubscription={() =>
                    Promise.resolve({ subscriptionId: "SUB-123" })
                }
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute("disabled");
    });

    it("should default type to subscribe", () => {
        const { container } = render(
            <PayPalSubscriptionButton
                onApprove={() => Promise.resolve()}
                createSubscription={() =>
                    Promise.resolve({ subscriptionId: "SUB-123" })
                }
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-button");
        expect(button).toHaveAttribute("type", "subscribe");
    });

    it("should pass hook props to usePayPalSubscriptionPaymentSession", () => {
        const hookProps = {
            onApprove: () => Promise.resolve(),
            createSubscription: () =>
                Promise.resolve({ subscriptionId: "SUB-123" }),
            presentationMode: "auto" as const,
        };
        render(<PayPalSubscriptionButton {...hookProps} />);
        expect(mockUsePayPalSubscriptionPaymentSession).toHaveBeenCalledWith(
            hookProps,
        );
    });

    it("should log error to console when an error from the hook is present", () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();
        const testError = new Error("Test error");
        mockUsePayPalSubscriptionPaymentSession.mockReturnValue({
            error: testError,
            isPending: false,
            handleClick: mockHandleClick,
        });
        render(
            <PayPalSubscriptionButton
                onApprove={() => Promise.resolve()}
                createSubscription={() =>
                    Promise.resolve({ subscriptionId: "SUB-123" })
                }
                presentationMode="auto"
            />,
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
        consoleErrorSpy.mockRestore();
    });
});
