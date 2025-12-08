/**
 * @jest-environment node
 */

import React from "react";
import { renderToString } from "react-dom/server";

import { usePayPal } from "../hooks/usePayPal";
import { CardFieldsState } from "../context/CardFieldsProviderContext";
import { useCardFields } from "../hooks/useCardFields";
import { INSTANCE_LOADING_STATE } from "../types";
import { isServer } from "../utils";
import { CardFieldsProvider } from "./CardFieldsProvider";

import type { CardFieldsSessionType } from "../types";

jest.mock("../hooks/usePayPal");

jest.mock("../utils", () => ({
    ...jest.requireActual("../utils"),
    isServer: () => true,
}));

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;

// Test utilites
function expectInitialState(state: Partial<CardFieldsState>): void {
    expect(state.cardFieldsSession).toBe(null);
    expect(state.cardFieldsError).toBe(null);
}

// Render helpers
function renderSSRCardFieldsProvider({
    sessionType,
    children,
}: {
    sessionType: CardFieldsSessionType;
    children?: React.ReactNode;
}) {
    const { cardFieldsState, TestComponent } = setupSSRTestComponent();

    const html = renderToString(
        <CardFieldsProvider sessionType={sessionType}>
            <TestComponent>{children}</TestComponent>
        </CardFieldsProvider>,
    );

    return { html, cardFieldsState };
}

function setupSSRTestComponent() {
    const cardFieldsState: CardFieldsState = {
        cardFieldsSession: null,
        cardFieldsError: null,
    };

    function TestComponent({
        children = null,
    }: {
        children?: React.ReactNode;
    }) {
        try {
            const newCardFieldsState = useCardFields();
            Object.assign(cardFieldsState, newCardFieldsState);
        } catch (error) {
            cardFieldsState.cardFieldsError = error as Error;
        }

        return <>{children}</>;
    }

    return { cardFieldsState, TestComponent };
}

describe("CardFieldsProvider SSR", () => {
    beforeEach(() => {
        mockUsePayPal.mockReturnValue({
            sdkInstance: null,
            loadingStatus: INSTANCE_LOADING_STATE.PENDING,
            eligiblePaymentMethods: null,
            error: null,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Server-Side Rendering", () => {
        test("should verify isServer mock is working", () => {
            expect(isServer()).toBe(true);
        });

        test("should not attempt DOM access during server rendering", () => {
            // In Node environment, document should be undefined
            expect(typeof document).toBe("undefined");

            // Will throw error if any DOM access is attempted during render
            expect(() =>
                renderSSRCardFieldsProvider({
                    sessionType: "one-time-payment",
                }),
            ).not.toThrow();
        });

        test("should work correctly in SSR context", () => {
            const { cardFieldsState } = renderSSRCardFieldsProvider({
                sessionType: "one-time-payment",
            });

            expectInitialState(cardFieldsState);
        });

        test("should render without warnings or errors", () => {
            // This sdkInstance state would fail client side
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
            });

            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation();

            const { html } = renderSSRCardFieldsProvider({
                sessionType: "one-time-payment",
                children: <div>SSR Content</div>,
            });

            expect(consoleSpy).not.toHaveBeenCalled();
            expect(html).toBeTruthy();
            expect(typeof html).toBe("string");
            expect(html).toContain("SSR Content");

            consoleSpy.mockRestore();
        });
    });

    describe("Hydration Preparation", () => {
        test("should prepare serializable state for client hydration", () => {
            const { cardFieldsState } = renderSSRCardFieldsProvider({
                sessionType: "one-time-payment",
            });

            // Server state should be safe for serialization
            const serializedState = JSON.stringify(cardFieldsState);

            expect(() => JSON.parse(serializedState)).not.toThrow();

            const parsedState = JSON.parse(serializedState);
            expectInitialState(parsedState);
        });

        test("should maintain consistent state with different options", () => {
            const { cardFieldsState: cardFieldsState1 } =
                renderSSRCardFieldsProvider({
                    sessionType: "one-time-payment",
                });
            const { cardFieldsState: cardFieldsState2 } =
                renderSSRCardFieldsProvider({ sessionType: "save-payment" });

            // Both should have consistent initial state regardless of options
            expectInitialState(cardFieldsState1);
            expectInitialState(cardFieldsState2);
        });
    });

    describe("Multiple renders", () => {
        test("should maintain state consistency across multiple server renders", () => {
            const { html: html1, cardFieldsState: cardFieldsState1 } =
                renderSSRCardFieldsProvider({
                    sessionType: "one-time-payment",
                });
            const { html: html2, cardFieldsState: cardFieldsState2 } =
                renderSSRCardFieldsProvider({
                    sessionType: "one-time-payment",
                });

            expectInitialState(cardFieldsState1);
            expectInitialState(cardFieldsState2);
            expect(html1).toBe(html2);
        });

        test("should generate consistent HTML across renders", () => {
            const { html: html1 } = renderSSRCardFieldsProvider({
                sessionType: "one-time-payment",
                children: <div data-testid="ssr-content">Test Content</div>,
            });
            const { html: html2 } = renderSSRCardFieldsProvider({
                sessionType: "one-time-payment",
                children: <div data-testid="ssr-content">Test Content</div>,
            });

            expect(html1).toBe(html2);
            expect(html1).toContain('data-testid="ssr-content"');
        });
    });
});
