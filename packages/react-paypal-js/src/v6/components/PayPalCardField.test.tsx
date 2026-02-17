import React from "react";
import { render } from "@testing-library/react";

import { usePayPalCardFieldsSession } from "../hooks/usePayPalCardFields";
import { PayPalCardField } from "./PayPalCardField";
import { CardFieldComponent, CardFieldsOneTimePaymentSession } from "../types";

jest.mock("../hooks/usePayPalCardFields");

const mockUsePayPalCardFieldsSession =
    usePayPalCardFieldsSession as jest.MockedFunction<
        typeof usePayPalCardFieldsSession
    >;

const mockCardFieldElement = document.createElement(
    "div",
) as unknown as CardFieldComponent;
mockCardFieldElement.destroy = jest.fn();

// Mock Factories
const createMockCardFieldsOneTimePaymentSession = (
    overrides?: Partial<CardFieldsOneTimePaymentSession>,
): CardFieldsOneTimePaymentSession => ({
    submit: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    update: jest.fn(),
    createCardFieldsComponent: jest.fn(),
    destroy: jest.fn(),
    ...overrides,
});

describe("PayPalCardField", () => {
    let mockCreateCardFieldsComponent: jest.Mock;
    let mockCardFieldsOneTimePaymentSession: CardFieldsOneTimePaymentSession;

    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateCardFieldsComponent = jest
            .fn()
            .mockReturnValue(mockCardFieldElement);
        mockCardFieldsOneTimePaymentSession =
            createMockCardFieldsOneTimePaymentSession({
                createCardFieldsComponent: mockCreateCardFieldsComponent,
            });
        mockUsePayPalCardFieldsSession.mockReturnValue({
            cardFieldsSession: mockCardFieldsOneTimePaymentSession,
            setCardFieldsSessionType: jest.fn(),
            setError: jest.fn(),
        });
    });

    it("Should not create a card field if the session is not available", () => {
        mockUsePayPalCardFieldsSession.mockReset();
        mockUsePayPalCardFieldsSession.mockReturnValueOnce({
            cardFieldsSession: null,
            setCardFieldsSessionType: jest.fn(),
            setError: jest.fn(),
        });
        const { container } = render(<PayPalCardField type="number" />);

        const cardFieldContainer = container.querySelector("div");
        expect(cardFieldContainer).toBeInTheDocument();
        expect(cardFieldContainer?.children.length).toBe(0);
    });

    it("Should create a card field with the correct options and append it to the container", () => {
        const mockType = "number";
        const mockPlaceholder = "test-placeholder";
        const testStyles = {
            input: {
                background: "red",
            },
        };

        const { container } = render(
            <PayPalCardField
                type={mockType}
                placeholder={mockPlaceholder}
                style={testStyles}
            />,
        );

        expect(mockCreateCardFieldsComponent).toHaveBeenCalledWith({
            type: mockType,
            placeholder: mockPlaceholder,
            style: testStyles,
        });
        const cardFieldContainer = container.querySelector("div");
        expect(cardFieldContainer).toBeInTheDocument();
        expect(cardFieldContainer).toContainElement(mockCardFieldElement);
    });

    it("Should call field's destroy method on unmount", () => {
        const { unmount } = render(<PayPalCardField type="number" />);

        unmount();

        expect(mockCardFieldElement.destroy).toHaveBeenCalled();
    });

    it("should pass latest options to the session on session change", () => {
        const mockType = "number";
        const initialConfig = {
            placeholder: "initial-placeholder",
            label: "initial label",
        };
        const updatedConfig = {
            placeholder: "updated-placeholder",
            label: "updated label",
        };

        // Rendering first session
        const { rerender } = render(
            <PayPalCardField type={mockType} {...initialConfig} />,
        );
        expect(mockCreateCardFieldsComponent).toHaveBeenCalledWith({
            type: mockType,
            ...initialConfig,
        });
        expect(mockCreateCardFieldsComponent).toHaveBeenCalledTimes(1);

        // Rendering second session with new options
        const mockCardFieldsOneTimePaymentSecondSession =
            createMockCardFieldsOneTimePaymentSession({
                createCardFieldsComponent: mockCreateCardFieldsComponent,
            });
        mockUsePayPalCardFieldsSession.mockReturnValueOnce({
            cardFieldsSession: mockCardFieldsOneTimePaymentSecondSession,
            setCardFieldsSessionType: jest.fn(),
            setError: jest.fn(),
        });

        rerender(<PayPalCardField type={mockType} {...updatedConfig} />);

        expect(mockCardFieldElement.destroy).toHaveBeenCalledTimes(1);
        expect(mockCreateCardFieldsComponent).toHaveBeenCalledTimes(2);
        expect(mockCreateCardFieldsComponent).toHaveBeenLastCalledWith({
            type: mockType,
            ...updatedConfig,
        });
    });

    it("Should call setError if card field creation throws an error and no field should be created", () => {
        const mockErrorMessage = new Error("Card field creation failed");
        const mockSetError = jest.fn();

        mockCreateCardFieldsComponent.mockImplementationOnce(() => {
            throw mockErrorMessage;
        });
        mockCardFieldsOneTimePaymentSession =
            createMockCardFieldsOneTimePaymentSession({
                createCardFieldsComponent: mockCreateCardFieldsComponent,
            });
        mockUsePayPalCardFieldsSession.mockReturnValueOnce({
            cardFieldsSession: mockCardFieldsOneTimePaymentSession,
            setCardFieldsSessionType: jest.fn(),
            setError: mockSetError,
        });

        const { container } = render(<PayPalCardField type="number" />);

        expect(mockSetError).toHaveBeenCalledWith(mockErrorMessage);
        const cardFieldContainer = container.querySelector("div");
        expect(cardFieldContainer).toBeInTheDocument();
        expect(cardFieldContainer?.children.length).toBe(0);
    });

    describe("Container Props", () => {
        it("Should pass className to the container div", () => {
            const testContainerClassName = "test-class-name";

            const { container } = render(
                <PayPalCardField
                    type="number"
                    containerClassName={testContainerClassName}
                />,
            );

            const cardFieldContainer = container.querySelector("div");
            expect(cardFieldContainer).toHaveClass(testContainerClassName);
        });

        it("Should pass style to the container div", () => {
            const testContainerStyles = {
                height: "3rem",
                marginBottom: "1rem",
            };

            const { container } = render(
                <PayPalCardField
                    type="number"
                    containerStyles={testContainerStyles}
                />,
            );

            const cardFieldContainer = container.querySelector("div");
            expect(cardFieldContainer).toHaveStyle(testContainerStyles);
        });
    });
});
