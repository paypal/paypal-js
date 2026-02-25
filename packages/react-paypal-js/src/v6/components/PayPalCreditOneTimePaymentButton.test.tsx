import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { PayPalCreditOneTimePaymentButton } from "./PayPalCreditOneTimePaymentButton";
import { usePayPalCreditOneTimePaymentSession } from "../hooks/usePayPalCreditOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

jest.mock("../hooks/usePayPalCreditOneTimePaymentSession", () => ({
    usePayPalCreditOneTimePaymentSession: jest.fn(),
}));
jest.mock("../hooks/usePayPal", () => ({
    usePayPal: jest.fn(),
}));

describe("PayPalCreditOneTimePaymentButton", () => {
    const mockHandleClick = jest.fn();
    const mockUsePayPalCreditOneTimePaymentSession =
        usePayPalCreditOneTimePaymentSession as jest.Mock;
    const mockUsePayPal = usePayPal as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePayPalCreditOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        mockUsePayPal.mockReturnValue({
            eligiblePaymentMethods: null,
            isHydrated: true,
        });
    });

    it("should render paypal-credit-button when hydrated", () => {
        const { container } = render(
            <PayPalCreditOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(
            container.querySelector("paypal-credit-button"),
        ).toBeInTheDocument();
    });

    it("should render a div when not hydrated", () => {
        mockUsePayPal.mockReturnValue({
            eligiblePaymentMethods: null,
            isHydrated: false,
        });
        const { container } = render(
            <PayPalCreditOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(
            container.querySelector("paypal-credit-button"),
        ).not.toBeInTheDocument();
        expect(container.querySelector("div")).toBeInTheDocument();
    });

    it("should call handleClick when button is clicked", () => {
        const { container } = render(
            <PayPalCreditOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-credit-button");

        // @ts-expect-error button should be defined at this point, test will error if not
        fireEvent.click(button);

        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it("should disable the button when disabled=true is given as a prop", () => {
        const { container } = render(
            <PayPalCreditOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
                disabled={true}
            />,
        );
        const button = container.querySelector("paypal-credit-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should disable button when error is present", () => {
        jest.spyOn(console, "error").mockImplementation();
        mockUsePayPalCreditOneTimePaymentSession.mockReturnValue({
            error: new Error("Test error"),
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalCreditOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-credit-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should not disable button when error is null", () => {
        mockUsePayPalCreditOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalCreditOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-credit-button");
        expect(button).not.toHaveAttribute("disabled");
    });

    it("should return null when isPending is true", () => {
        mockUsePayPalCreditOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: true,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayPalCreditOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(
            container.querySelector("paypal-credit-button"),
        ).not.toBeInTheDocument();
        expect(container.firstChild).toBeNull();
    });

    it("should pass hook props to usePayPalCreditOneTimePaymentSession", () => {
        const hookProps = {
            clientToken: "test-token",
            amount: "10.00",
            currency: "USD",
            onApprove: () => Promise.resolve(),
            orderId: "123",
            presentationMode: "auto" as const,
        };
        render(<PayPalCreditOneTimePaymentButton {...hookProps} />);
        expect(mockUsePayPalCreditOneTimePaymentSession).toHaveBeenCalledWith(
            hookProps,
        );
    });

    describe("auto-population from eligibility context", () => {
        it("should auto-populate countryCode from eligibility context", () => {
            mockUsePayPal.mockReturnValue({
                isHydrated: true,
                eligiblePaymentMethods: {
                    isEligible: jest.fn().mockReturnValue(true),
                    getDetails: jest.fn().mockReturnValue({
                        countryCode: "US",
                        canBeVaulted: false,
                    }),
                },
            });

            const { container } = render(
                <PayPalCreditOneTimePaymentButton
                    onApprove={() => Promise.resolve()}
                    orderId="123"
                    presentationMode="auto"
                />,
            );

            const button = container.querySelector("paypal-credit-button");
            expect(button).toHaveAttribute("countrycode", "US");
        });

        it("should handle when eligibility was not fetched", () => {
            mockUsePayPal.mockReturnValue({
                isHydrated: true,
                eligiblePaymentMethods: null,
            });

            const { container } = render(
                <PayPalCreditOneTimePaymentButton
                    onApprove={() => Promise.resolve()}
                    orderId="123"
                    presentationMode="auto"
                />,
            );

            const button = container.querySelector("paypal-credit-button");
            expect(button).not.toHaveAttribute("countrycode");
        });

        it("should handle when credit details are not available", () => {
            mockUsePayPal.mockReturnValue({
                isHydrated: true,
                eligiblePaymentMethods: {
                    isEligible: jest.fn().mockReturnValue(false),
                    getDetails: jest.fn().mockReturnValue(undefined),
                },
            });

            const { container } = render(
                <PayPalCreditOneTimePaymentButton
                    onApprove={() => Promise.resolve()}
                    orderId="123"
                    presentationMode="auto"
                />,
            );

            const button = container.querySelector("paypal-credit-button");
            expect(button).not.toHaveAttribute("countrycode");
        });
    });
});
