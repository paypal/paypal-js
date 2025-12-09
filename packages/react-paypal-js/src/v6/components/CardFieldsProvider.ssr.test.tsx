/**
 * @jest-environment node
 */

import React from "react";
import { renderToString } from "react-dom/server";

import { usePayPal } from "../hooks/usePayPal";
import { useCardFields, useCardFieldsSession } from "../hooks/useCardFields";
import { INSTANCE_LOADING_STATE } from "../types";
import { isServer } from "../utils";
import { CardFieldsProvider } from "./CardFieldsProvider";

import type {
    CardFieldsSessionState,
    CardFieldsStatusState,
} from "../context/CardFieldsProviderContext";
import type { CardFieldsSessionType } from "./CardFieldsProvider";

jest.mock("../hooks/usePayPal");

jest.mock("../utils", () => ({
    ...jest.requireActual("../utils"),
    isServer: () => true,
}));

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;

const oneTimePaymentSessionType: CardFieldsSessionType = "one-time-payment";
const savePaymentSessionType: CardFieldsSessionType = "save-payment";

// Test utilites
function expectInitialStatusState(state: CardFieldsStatusState): void {
    expect(state.cardFieldsError).toBe(null);
}

function expectInitialSessionState(state: CardFieldsSessionState): void {
    expect(state.cardFieldsSession).toBe(null);
}

// Render helpers
function renderSSRCardFieldsProvider({
    sessionType,
    children,
}: {
    sessionType: CardFieldsSessionType;
    children?: React.ReactNode;
}) {
    const { cardFieldsSessionState, cardFieldsStatusState, TestComponent } =
        setupSSRTestComponent();

    const html = renderToString(
        <CardFieldsProvider sessionType={sessionType}>
            <TestComponent>{children}</TestComponent>
        </CardFieldsProvider>,
    );

    return { html, cardFieldsSessionState, cardFieldsStatusState };
}

function setupSSRTestComponent() {
    const cardFieldsStatusState: CardFieldsStatusState = {
        cardFieldsError: null,
    };

    const cardFieldsSessionState: CardFieldsSessionState = {
        cardFieldsSession: null,
    };

    function TestComponent({
        children = null,
    }: {
        children?: React.ReactNode;
    }) {
        const newCardFieldsStatusState = useCardFields();
        const newCardFieldsSessionState = useCardFieldsSession();

        Object.assign(cardFieldsStatusState, newCardFieldsStatusState);
        Object.assign(cardFieldsSessionState, newCardFieldsSessionState);

        return <>{children}</>;
    }

    return { cardFieldsStatusState, cardFieldsSessionState, TestComponent };
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
                    sessionType: oneTimePaymentSessionType,
                }),
            ).not.toThrow();
        });

        test("should work correctly in SSR context", () => {
            const { cardFieldsSessionState, cardFieldsStatusState } =
                renderSSRCardFieldsProvider({
                    sessionType: oneTimePaymentSessionType,
                });

            expectInitialStatusState(cardFieldsStatusState);
            expectInitialSessionState(cardFieldsSessionState);
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
                sessionType: oneTimePaymentSessionType,
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
            const { cardFieldsSessionState, cardFieldsStatusState } =
                renderSSRCardFieldsProvider({
                    sessionType: oneTimePaymentSessionType,
                });

            // Server state should be safe for serialization
            const serializedSessionState = JSON.stringify(
                cardFieldsSessionState,
            );
            const serializedStatusState = JSON.stringify(cardFieldsStatusState);

            expect(() => JSON.parse(serializedSessionState)).not.toThrow();
            expect(() => JSON.parse(serializedStatusState)).not.toThrow();

            const parsedSessionState = JSON.parse(serializedSessionState);
            const parsedStatusState = JSON.parse(serializedStatusState);

            expectInitialSessionState(parsedSessionState);
            expectInitialStatusState(parsedStatusState);
        });

        test("should maintain consistent state with different options", () => {
            const {
                cardFieldsStatusState: cardFieldsStatusState1,
                cardFieldsSessionState: cardFieldsSessionState1,
            } = renderSSRCardFieldsProvider({
                sessionType: oneTimePaymentSessionType,
            });
            const {
                cardFieldsStatusState: cardFieldsStatusState2,
                cardFieldsSessionState: cardFieldsSessionState2,
            } = renderSSRCardFieldsProvider({
                sessionType: savePaymentSessionType,
            });

            // Both should have consistent initial state regardless of options
            expectInitialStatusState(cardFieldsStatusState1);
            expectInitialSessionState(cardFieldsSessionState1);

            expectInitialStatusState(cardFieldsStatusState2);
            expectInitialSessionState(cardFieldsSessionState2);
        });
    });

    describe("Multiple renders", () => {
        test("should maintain state consistency across multiple server renders", () => {
            const {
                html: html1,
                cardFieldsStatusState: cardFieldsStatusState1,
                cardFieldsSessionState: cardFieldsSessionState1,
            } = renderSSRCardFieldsProvider({
                sessionType: oneTimePaymentSessionType,
            });
            const {
                html: html2,
                cardFieldsStatusState: cardFieldsStatusState2,
                cardFieldsSessionState: cardFieldsSessionState2,
            } = renderSSRCardFieldsProvider({
                sessionType: oneTimePaymentSessionType,
            });

            expectInitialStatusState(cardFieldsStatusState1);
            expectInitialSessionState(cardFieldsSessionState1);
            expectInitialStatusState(cardFieldsStatusState2);
            expectInitialSessionState(cardFieldsSessionState2);
            expect(html1).toBe(html2);
        });

        test("should generate consistent HTML across renders", () => {
            const { html: html1 } = renderSSRCardFieldsProvider({
                sessionType: oneTimePaymentSessionType,
                children: <div data-testid="ssr-content">Test Content</div>,
            });
            const { html: html2 } = renderSSRCardFieldsProvider({
                sessionType: oneTimePaymentSessionType,
                children: <div data-testid="ssr-content">Test Content</div>,
            });

            expect(html1).toBe(html2);
            expect(html1).toContain('data-testid="ssr-content"');
        });
    });

    describe("Context isolation", () => {
        const expectedSessionContextKeys = ["cardFieldsSession"] as const;
        const expectedStatusContextKeys = ["cardFieldsError"] as const;

        describe("useCardFields", () => {
            test("should only return status context values", () => {
                const { cardFieldsStatusState } = renderSSRCardFieldsProvider({
                    sessionType: oneTimePaymentSessionType,
                });

                const receivedStatusKeys = Object.keys(cardFieldsStatusState);
                expect(receivedStatusKeys.sort()).toEqual(
                    [...expectedStatusContextKeys].sort(),
                );
            });

            test("should not return session context values", () => {
                const { cardFieldsStatusState } = renderSSRCardFieldsProvider({
                    sessionType: oneTimePaymentSessionType,
                });

                const receivedStatusKeys = Object.keys(cardFieldsStatusState);
                expectedSessionContextKeys.forEach((key) => {
                    expect(receivedStatusKeys).not.toContain(key);
                });
            });
        });

        describe("useCardFieldsSession", () => {
            test("should only return session context values", () => {
                const { cardFieldsSessionState } = renderSSRCardFieldsProvider({
                    sessionType: oneTimePaymentSessionType,
                });

                const receivedSessionKeys = Object.keys(cardFieldsSessionState);
                expect(receivedSessionKeys.sort()).toEqual(
                    [...expectedSessionContextKeys].sort(),
                );
            });

            test("should not return status context values", () => {
                const { cardFieldsSessionState } = renderSSRCardFieldsProvider({
                    sessionType: oneTimePaymentSessionType,
                });

                const receivedSessionKeys = Object.keys(cardFieldsSessionState);
                expectedStatusContextKeys.forEach((key) => {
                    expect(receivedSessionKeys).not.toContain(key);
                });
            });
        });
    });
});
