import React from "react";
import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import { loadScript } from "@paypal/paypal-js";
import { PayPalScriptProvider } from "./PayPalScriptProvider";
import { usePayPalScriptReducer } from "../hooks/scriptProviderHooks";
import {
    SCRIPT_ID,
    DATA_SDK_INTEGRATION_SOURCE,
    DATA_SDK_INTEGRATION_SOURCE_VALUE,
} from "../constants";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

function loadScriptMockImplementation({
    "client-id": clientID,
    [SCRIPT_ID]: reactPayPalScriptID,
}) {
    const newScript = document.createElement("script");
    newScript.src = `https://www.paypal.com/sdk/js?client-id=${clientID}`;
    newScript.setAttribute(SCRIPT_ID, reactPayPalScriptID);

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
            [SCRIPT_ID]: expect.stringContaining("react-paypal-js"),
            [DATA_SDK_INTEGRATION_SOURCE]: DATA_SDK_INTEGRATION_SOURCE_VALUE,
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
            [SCRIPT_ID]: expect.stringContaining("react-paypal-js"),
            [DATA_SDK_INTEGRATION_SOURCE]: DATA_SDK_INTEGRATION_SOURCE_VALUE,
        });

        // verify initial loading state
        expect(state.isPending).toBeTruthy();
        await waitFor(() => expect(state.isRejected).toBeTruthy());
        expect(state.isPending).toBeFalsy();
        expect(state.isResolved).toBeFalsy();
    });

    test("should control script loading with the deferLoading prop", async () => {
        const { state, TestComponent } = setupTestComponent();

        const { rerender } = render(
            <PayPalScriptProvider
                deferLoading={true}
                options={{ "client-id": "test" }}
            >
                <TestComponent />
            </PayPalScriptProvider>
        );

        // verify initial state
        expect(state.isInitial).toBe(true);
        expect(loadScript).not.toHaveBeenCalled();

        // re-render the same PayPalScriptProvider component with different props
        rerender(
            <PayPalScriptProvider
                deferLoading={false}
                options={{ "client-id": "test" }}
            >
                <TestComponent />
            </PayPalScriptProvider>
        );

        expect(loadScript).toHaveBeenCalledWith({
            "client-id": "test",
            [SCRIPT_ID]: expect.stringContaining("react-paypal-js"),
            [DATA_SDK_INTEGRATION_SOURCE]: DATA_SDK_INTEGRATION_SOURCE_VALUE,
        });

        expect(state.isPending).toBe(true);
        await waitFor(() => expect(state.isResolved).toBe(true));
    });

    test("should remount without reloading the sdk script when the options have not changed", async () => {
        const { state, TestComponent } = setupTestComponent();

        // the paypal-js loadScript() function avoids reloading the <script> when the options have not changed
        const options = {
            "client-id": "test",
        };

        const { unmount } = render(
            <PayPalScriptProvider options={options}>
                <TestComponent />
            </PayPalScriptProvider>
        );

        // unmount to simulate <PayPalScriptProvider> getting removed from the DOM
        unmount();

        render(
            <PayPalScriptProvider options={options}>
                <TestComponent />
            </PayPalScriptProvider>
        );

        await waitFor(() => expect(state.isResolved).toBeTruthy());

        const firstLoadScriptCall = loadScript.mock.calls[0][0];
        const secondLoadScriptCall = loadScript.mock.calls[1][0];

        expect(firstLoadScriptCall).toEqual(secondLoadScriptCall);
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
        const firstScriptID = state.options[SCRIPT_ID];

        // this click dispatches the action "resetOptions" causing the script to reload
        fireEvent.click(screen.getByText("Reload button"));
        await waitFor(() => expect(state.isResolved).toBeTruthy());
        const secondScriptID = state.options[SCRIPT_ID];

        expect(
            document.querySelector(`script[${SCRIPT_ID}="${secondScriptID}"]`)
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
