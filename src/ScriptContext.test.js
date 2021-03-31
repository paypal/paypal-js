import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import { PayPalScriptProvider, usePayPalScriptReducer } from "./ScriptContext";
import { loadScript } from "@paypal/paypal-js";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

function loadScriptMockImplementation({
    "client-id": clientID,
    "data-react-paypal-script-id": reactPayPalScriptID,
}) {
    const newScript = document.createElement("script");
    newScript.src = `https://www.paypal.com/sdk/js?client-id=${clientID}`;
    newScript.setAttribute("data-react-paypal-script-id", reactPayPalScriptID);

    document.head.insertBefore(newScript, document.head.firstElementChild);
    return Promise.resolve({});
}

describe("<PayPalScriptProvider />", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        loadScript.mockImplementation(loadScriptMockImplementation);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should set "isResolved" state to "true" after loading the script', async () => {
        const { state, TestComponent } = setupTestComponent();
        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <TestComponent />
            </PayPalScriptProvider>
        );
        expect(loadScript).toHaveBeenCalledWith({
            "client-id": "test",
            "data-react-paypal-script-id": expect.stringContaining(
                "react-paypal-js"
            ),
        });

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
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <TestComponent />
            </PayPalScriptProvider>
        );
        expect(loadScript).toHaveBeenCalledWith({
            "client-id": "test",
            "data-react-paypal-script-id": expect.stringContaining(
                "react-paypal-js"
            ),
        });

        // verify initial loading state
        expect(state.isPending).toBeTruthy();
        await waitFor(() => expect(state.isRejected).toBeTruthy());
        expect(state.isPending).toBeFalsy();
        expect(state.isResolved).toBeFalsy();
    });
});

describe("usePayPalScriptReducer", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        loadScript.mockImplementation(loadScriptMockImplementation);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should manage state for loadScript()", async () => {
        const { state, TestComponent } = setupTestComponent();
        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <TestComponent />
            </PayPalScriptProvider>
        );

        expect(state.options).toHaveProperty("client-id", "test");
        expect(state.isPending).toBeTruthy();
        await waitFor(() => expect(state.isResolved).toBeTruthy());
    });

    test("should throw an error when used without <PayPalScriptProvider>", () => {
        const { TestComponent } = setupTestComponent();

        jest.spyOn(console, "error");
        console.error.mockImplementation(() => {
            // do nothing
        });

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
        const firstScriptID = state.options["data-react-paypal-script-id"];

        // this click dispatches the action "resetOptions" causing the script to reload
        fireEvent.click(screen.getByText("Reload button"));
        await waitFor(() => expect(state.isResolved).toBeTruthy());
        const secondScriptID = state.options["data-react-paypal-script-id"];

        expect(
            document.querySelector(
                `script[data-react-paypal-script-id="${secondScriptID}"]`
            )
        ).toBeTruthy();
        expect(firstScriptID).not.toBe(secondScriptID);

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
