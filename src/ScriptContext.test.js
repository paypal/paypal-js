import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import { PayPalScriptProvider, usePayPalScriptReducer } from "./ScriptContext";
import { loadScript } from "@paypal/paypal-js";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

describe("<PayPalScriptProvider />", () => {
    beforeEach(() => {
        loadScript.mockResolvedValue({});
    });

    test('should set "isResolved" state to "true" after loading the script', async () => {
        const { state, TestComponent } = setupTestComponent();
        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <TestComponent />
            </PayPalScriptProvider>
        );
        expect(loadScript).toHaveBeenCalledWith({ "client-id": "sb" });

        // verify initial loading state
        expect(state.isPending).toBeTruthy();
        await waitFor(() => expect(state.isResolved).toBeTruthy());
        expect(state.isPending).toBeFalsy();
        expect(state.isRejected).toBeFalsy();
    });

    test('should set "isRejected" state to "true" after failing to load the script', async () => {
        loadScript.mockRejectedValue(new Error());
        const { state, TestComponent } = setupTestComponent();
        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <TestComponent />
            </PayPalScriptProvider>
        );
        expect(loadScript).toHaveBeenCalledWith({ "client-id": "sb" });

        // verify initial loading state
        expect(state.isPending).toBeTruthy();
        await waitFor(() => expect(state.isRejected).toBeTruthy());
        expect(state.isPending).toBeFalsy();
        expect(state.isResolved).toBeFalsy();
    });
});

describe("usePayPalScriptReducer", () => {
    beforeEach(() => {
        loadScript.mockResolvedValue({});
    });

    test("should manage state for loadScript()", async () => {
        const { state, TestComponent } = setupTestComponent();
        render(
            <PayPalScriptProvider options={{ "client-id": "sb" }}>
                <TestComponent />
            </PayPalScriptProvider>
        );

        expect(state.options).toHaveProperty("client-id", "sb");
        expect(state.isPending).toBeTruthy();
        await waitFor(() => expect(state.isResolved).toBeTruthy());
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

        expect(state.options).toMatchObject({ "client-id": "abc" });
        expect(loadScript).toHaveBeenCalledWith(state.options);

        await waitFor(() => expect(state.isResolved).toBeTruthy());

        // this click dispatches the action "resetOptions" causing the script to reload
        fireEvent.click(screen.getByText("Reload button"));
        await waitFor(() => expect(state.isResolved).toBeTruthy());

        expect(state.options).toMatchObject({
            "client-id": "xyz",
            disableFunding: "card",
        });
        expect(loadScript).toHaveBeenCalledWith(state.options);
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

function ResetParamsOnClick({ options }) {
    const [, dispatch] = usePayPalScriptReducer();

    function onClick() {
        dispatch({ type: "resetOptions", value: options });
    }

    return <button onClick={onClick}>Reload button</button>;
}
