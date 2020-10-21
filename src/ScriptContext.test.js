import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react";
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
    beforeEach(() => {
        document.head.innerHTML = "";
    });

    test('should manage state for loadScript() options and for "isLoaded"', () => {
        const { state, TestComponent } = setupTestComponent();
        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <TestComponent />
            </PayPalScriptProvider>
        );

        expect(state.options).toHaveProperty("client-id", "sb");
        expect(state.isLoaded).toBe(false);
    });

    test("should throw an error when used without <PayPalScriptProvider>", () => {
        const { TestComponent } = setupTestComponent();

        jest.spyOn(console, "error");
        console.error.mockImplementation(() => {});

        expect(() => render(<TestComponent />)).toThrow();
        console.error.mockRestore();
    });

    test("should use action 'resetOptions' to reload with new params", async () => {
        const { state, TestComponent } = setupTestComponent();

        render(
            <PayPalScriptProvider options={{ "client-id": "abc" }}>
                <TestComponent>
                    <ResetParamsOnClick
                        options={{ "client-id": "xyz", disableFunding: "card" }}
                    />
                </TestComponent>
            </PayPalScriptProvider>
        );

        let script = document.querySelector("head script");
        expect(state.options).toMatchObject({ "client-id": "abc" });
        expect(script.src).toBe("https://www.paypal.com/sdk/js?client-id=abc");

        await waitFor(() => expect(state.isLoaded).toBe(true));

        // this click dispatches the action "resetOptions" causing the script to reload
        fireEvent.click(screen.getByText("Reload button"));

        expect(state.options).toMatchObject({
            "client-id": "xyz",
            disableFunding: "card",
        });
        expect(script.src).toBe(
            "https://www.paypal.com/sdk/js?client-id=xyz&disableFunding=card"
        );
    });
});

function setupTestComponent() {
    const state = {};
    function TestComponent({ children = null }) {
        const [scriptState] = usePayPalScriptReducer();
        Object.assign(state, scriptState);
        return children;
    }

    return {
        state,
        TestComponent,
    };
}

// eslint-disable-next-line react/prop-types
function ResetParamsOnClick({ options }) {
    const [, dispatch] = usePayPalScriptReducer();

    function onClick() {
        dispatch({ type: "resetOptions", value: options });
    }

    return <button onClick={onClick}>Reload button</button>;
}
