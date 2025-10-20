import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { loadCoreSdkScript } from "@paypal/paypal-js/sdk-v6";

import { PayPalProvider } from "../components/PayPalProvider";
import { usePayPal } from "../hooks/usePayPal";
import { INSTANCE_LOADING_STATE } from "../types/PayPalProviderEnums";
import { usePayLaterOneTimePaymentSession } from "./useCreatePayLaterOneTimePaymentSession";
import {
    createMockPayPalNamespace,
    TEST_CLIENT_TOKEN,
    expectResolvedState,
} from "../components/providerTestUtils";

import type {
    CreateInstanceOptions,
    LoadCoreSdkScriptOptions,
    PayPalContextState,
} from "../types";

jest.mock("@paypal/paypal-js/sdk-v6", () => ({
    loadCoreSdkScript: jest.fn(),
}));

jest.mock("../utils", () => ({
    ...jest.requireActual("../utils"),
    isServer: () => false,
}));

const createInstanceOptions: CreateInstanceOptions<["paypal-payments"]> = {
    components: ["paypal-payments"],
    clientToken: TEST_CLIENT_TOKEN,
};

const scriptOptions: LoadCoreSdkScriptOptions = {
    environment: "sandbox",
};

function setupTestComponent() {
    const state: PayPalContextState = {
        loadingStatus: INSTANCE_LOADING_STATE.INITIAL,
        sdkInstance: null,
        eligiblePaymentMethods: null,
        error: null,
        dispatch: jest.fn(),
    };

    function TestComponent({
        children = null,
    }: {
        children?: React.ReactNode;
    }) {
        const instanceState = usePayPal();
        Object.assign(state, instanceState);
        return <>{children}</>;
    }

    return {
        state,
        TestComponent,
    };
}

function renderProvider(
    instanceOptions = createInstanceOptions,
    scriptOpts = scriptOptions,
    children?: React.ReactNode,
) {
    const { state, TestComponent } = setupTestComponent();

    const result = render(
        <PayPalProvider
            components={instanceOptions.components}
            clientToken={instanceOptions.clientToken}
            scriptOptions={scriptOpts}
        >
            <TestComponent>{children}</TestComponent>
        </PayPalProvider>,
    );

    return { ...result, state };
}

describe("usePayLaterOneTimePaymentSession", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        (loadCoreSdkScript as jest.Mock).mockResolvedValue(
            createMockPayPalNamespace(),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it.only("should provide a click handler that calls session start", async () => {
        const MockButtonComponent = () => {
            const { handleClick } = usePayLaterOneTimePaymentSession({
                presentationMode: "auto",
                createOrder: () => ({ orderId: "123" }),
                onApprove: () => true,
                onCancel: () => true,
                onError: () => true,
            });

            return <button onClick={handleClick}>Mock Button</button>;
        };

        const { state } = renderProvider({ children: <MockButtonComponent /> });

        await waitFor(() => expectResolvedState(state));

        // TODO implement
        throw new Error("implement");
    });

    it("should error if there is no sdkInstance when called", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should provide a cancel handler that cancels the session", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should error if the click handler is called and there is no sdkInstance", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should provide a destroy handler that destroys the session", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should not re-run if callbacks are updated", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should destroy the session when the parent component is unmounted", () => {
        // TODO implement
        throw new Error("implement");
    });
});
