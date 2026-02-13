import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { PayLaterOneTimePaymentButton } from "./PayLaterOneTimePaymentButton";
import { usePayLaterOneTimePaymentSession } from "../hooks/usePayLaterOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";

jest.mock("../hooks/usePayLaterOneTimePaymentSession", () => ({
    usePayLaterOneTimePaymentSession: jest.fn(),
}));
jest.mock("../hooks/usePayPal", () => ({
    usePayPal: jest.fn(),
}));

describe("PayLaterOneTimePaymentButton", () => {
    const mockHandleClick = jest.fn();
    const mockUsePayLaterOneTimePaymentSession =
        usePayLaterOneTimePaymentSession as jest.Mock;
    const mockUsePayPal = usePayPal as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePayLaterOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        mockUsePayPal.mockReturnValue({
            eligiblePaymentMethods: null,
            isHydrated: true,
        });
    });

    it("should render paypal-pay-later-button when hydrated", () => {
        const { container } = render(
            <PayLaterOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(
            container.querySelector("paypal-pay-later-button"),
        ).toBeInTheDocument();
    });

    it("should render a div when not hydrated", () => {
        mockUsePayPal.mockReturnValue({
            isHydrated: false,
        });
        const { container } = render(
            <PayLaterOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(
            container.querySelector("paypal-pay-later-button"),
        ).not.toBeInTheDocument();
        expect(container.querySelector("div")).toBeInTheDocument();
    });

    it("should call handleClick when button is clicked", () => {
        const { container } = render(
            <PayLaterOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-pay-later-button");

        // @ts-expect-error button should be defined at this point, test will error if not
        fireEvent.click(button);

        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it("should disable the button when disabled=true is given as a prop", () => {
        const { container } = render(
            <PayLaterOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
                disabled={true}
            />,
        );
        const button = container.querySelector("paypal-pay-later-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should disable button when error is present", () => {
        jest.spyOn(console, "error").mockImplementation();
        mockUsePayLaterOneTimePaymentSession.mockReturnValue({
            error: new Error("Test error"),
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayLaterOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-pay-later-button");
        expect(button).toHaveAttribute("disabled");
    });

    it("should not disable button when error is null", () => {
        mockUsePayLaterOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: false,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayLaterOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        const button = container.querySelector("paypal-pay-later-button");
        expect(button).not.toHaveAttribute("disabled");
    });

    it("should return null when isPending is true", () => {
        mockUsePayLaterOneTimePaymentSession.mockReturnValue({
            error: null,
            isPending: true,
            handleClick: mockHandleClick,
        });
        const { container } = render(
            <PayLaterOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(
            container.querySelector("paypal-pay-later-button"),
        ).not.toBeInTheDocument();
        expect(container.firstChild).toBeNull();
    });

    it("should pass hook props to usePayLaterOneTimePaymentSession", () => {
        const hookProps = {
            clientToken: "test-token",
            amount: "10.00",
            currency: "USD",
            onApprove: () => Promise.resolve(),
            orderId: "123",
            presentationMode: "auto" as const,
        };
        render(<PayLaterOneTimePaymentButton {...hookProps} />);
        expect(mockUsePayLaterOneTimePaymentSession).toHaveBeenCalledWith(
            hookProps,
        );
    });

    describe("auto-population from eligibility context", () => {
        it("should auto-populate countryCode and productCode from eligibility context", () => {
            mockUsePayPal.mockReturnValue({
                eligiblePaymentMethods: {
                    isEligible: jest.fn().mockReturnValue(true),
                    getDetails: jest.fn().mockReturnValue({
                        countryCode: "US",
                        productCode: "PAYLATER",
                        canBeVaulted: false,
                    }),
                },
                isHydrated: true,
            });

            const { container } = render(
                <PayLaterOneTimePaymentButton
                    onApprove={() => Promise.resolve()}
                    orderId="123"
                    presentationMode="auto"
                />,
            );

            const button = container.querySelector("paypal-pay-later-button");
            expect(button).toHaveAttribute("countrycode", "US");
            expect(button).toHaveAttribute("productcode", "PAYLATER");
        });

        it("should handle when eligibility was not fetched", () => {
            mockUsePayPal.mockReturnValue({
                eligiblePaymentMethods: null,
                isHydrated: true,
            });

            const { container } = render(
                <PayLaterOneTimePaymentButton
                    onApprove={() => Promise.resolve()}
                    orderId="123"
                    presentationMode="auto"
                />,
            );

            const button = container.querySelector("paypal-pay-later-button");
            expect(button).not.toHaveAttribute("countrycode");
            expect(button).not.toHaveAttribute("productcode");
        });

        it("should handle when PayLater details are not available", () => {
            mockUsePayPal.mockReturnValue({
                eligiblePaymentMethods: {
                    isEligible: jest.fn().mockReturnValue(false),
                    getDetails: jest.fn().mockReturnValue(undefined),
                },
                isHydrated: true,
            });

            const { container } = render(
                <PayLaterOneTimePaymentButton
                    onApprove={() => Promise.resolve()}
                    orderId="123"
                    presentationMode="auto"
                />,
            );

            const button = container.querySelector("paypal-pay-later-button");
            expect(button).not.toHaveAttribute("countrycode");
            expect(button).not.toHaveAttribute("productcode");
        });
    });
});
