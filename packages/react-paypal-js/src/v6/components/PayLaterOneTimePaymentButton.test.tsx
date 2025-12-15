import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { PayLaterOneTimePaymentButton } from "./PayLaterOneTimePaymentButton";
import { usePayLaterOneTimePaymentSession } from "../hooks/usePayLaterOneTimePaymentSession";
import { usePayPal } from "../hooks/usePayPal";
import { isServer } from "../utils";

jest.mock("../hooks/usePayLaterOneTimePaymentSession", () => ({
    usePayLaterOneTimePaymentSession: jest.fn(),
}));
jest.mock("../hooks/usePayPal", () => ({
    usePayPal: jest.fn(),
}));
jest.mock("../utils", () => ({
    isServer: jest.fn().mockReturnValue(false),
}));

describe("PayLaterOneTimePaymentButton", () => {
    const mockHandleClick = jest.fn();
    const mockUsePayLaterOneTimePaymentSession =
        usePayLaterOneTimePaymentSession as jest.Mock;
    const mockUsePayPal = usePayPal as jest.Mock;
    const mockIsServer = isServer as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePayLaterOneTimePaymentSession.mockReturnValue({
            error: null,
            handleClick: mockHandleClick,
        });
        mockUsePayPal.mockReturnValue({
            eligiblePaymentMethods: null,
        });
        mockIsServer.mockReturnValue(false);
    });

    it("should render paypal-pay-later-button when not on server side", () => {
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

    it("should render a div when on server side", () => {
        mockIsServer.mockReturnValue(true);
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

    it("should log error to console when an error from the hook is present", () => {
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();
        const testError = new Error("Test error");
        mockUsePayLaterOneTimePaymentSession.mockReturnValue({
            error: testError,
            handleClick: mockHandleClick,
        });
        render(
            <PayLaterOneTimePaymentButton
                onApprove={() => Promise.resolve()}
                orderId="123"
                presentationMode="auto"
            />,
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(testError);
        consoleErrorSpy.mockRestore();
    });

    describe("auto-population from eligibility context", () => {
        it("should auto-populate countryCode and productCode from eligibility context", () => {
            mockUsePayPal.mockReturnValue({
                eligiblePaymentMethods: {
                    eligible_methods: {
                        paypal_pay_later: {
                            country_code: "US",
                            product_code: "PAYLATER",
                        },
                    },
                },
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

        it("should handle when PayLater is not in the eligibility response", () => {
            mockUsePayPal.mockReturnValue({
                eligiblePaymentMethods: {
                    eligible_methods: {},
                },
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
