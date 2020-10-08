import React from "react";
import { render, waitFor } from "@testing-library/react";
import { PayPalScriptProvider, usePayPalScriptReducer } from "./ScriptContext";

describe("<PayPalScriptProvider />", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
    });

    test("should add the JS SDK <script> to the DOM", () => {
        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <></>
            </PayPalScriptProvider>
        );

        const script = document.querySelector("head script");
        expect(script).toBeTruthy();
        expect(script.src).toBe("https://www.paypal.com/sdk/js?client-id=sb");
    });

    test('should set "isLoaded" state to true after loading the script', async () => {
        const { state, TestComponent } = setupTestComponent();
        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <TestComponent />
            </PayPalScriptProvider>
        );

        // verify initial loading state
        expect(state.isLoaded).toBe(false);
        await waitFor(() => expect(state.isLoaded).toBe(true));
    });
});

describe("usePayPalScriptReducer", () => {
    test('should manage state for loadScript() options and for "isLoaded"', () => {
        const { state, TestComponent } = setupTestComponent();
        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <TestComponent />
            </PayPalScriptProvider>
        );

        expect(state).toHaveProperty("options");
        expect(state).toHaveProperty("isLoaded");
    });

    test("should throw an error when used without <PayPalScriptProvider>", () => {
        const { TestComponent } = setupTestComponent();

        jest.spyOn(console, "error");
        console.error.mockImplementation(() => {});

        expect(() => render(<TestComponent />)).toThrow();
        console.error.mockRestore();
    });
});

function setupTestComponent() {
    const state = {};
    function TestComponent() {
        const [scriptState] = usePayPalScriptReducer();
        Object.assign(state, scriptState);
        return null;
    }

    return {
        state,
        TestComponent,
    };
}
