import React, { FunctionComponent, ReactElement } from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";

import { PayPalScriptProvider, usePayPalScriptReducer } from "../index";
import { getOptionsFromQueryString } from "./utils";

const scriptProviderOptions: PayPalScriptOptions = {
    "client-id": "test",
    ...getOptionsFromQueryString(),
};

export default {
    title: "Example/PayPalScriptProvider",
    component: PayPalScriptProvider,
};

export const Default: FunctionComponent = () => {
    return (
        <PayPalScriptProvider options={scriptProviderOptions}>
            <PrintLoadingState />
            {/* add your paypal components here (ex: <PayPalButtons />) */}
        </PayPalScriptProvider>
    );
};

export const DeferLoading: FunctionComponent = () => {
    function LoadScriptButton() {
        const [{ isResolved }, dispatch] = usePayPalScriptReducer();

        return (
            <button
                type="button"
                style={{ display: "block", marginBottom: "20px" }}
                disabled={isResolved}
                onClick={() => {
                    dispatch({
                        type: "setLoadingStatus",
                        value: "pending",
                    });
                }}
            >
                LoadScript
            </button>
        );
    }

    return (
        <PayPalScriptProvider
            deferLoading={true}
            options={{
                ...scriptProviderOptions,
                "data-namespace": "defer_loading_example",
            }}
        >
            <PrintLoadingState />
            <LoadScriptButton />
        </PayPalScriptProvider>
    );
};

function PrintLoadingState(): ReactElement | null {
    const [{ isInitial, isPending, isResolved, isRejected }] =
        usePayPalScriptReducer();

    if (isInitial) {
        return (
            <p>
                <strong>isInitial</strong> - the sdk script has not been loaded
                yet. It has been deferred.{" "}
            </p>
        );
    } else if (isPending) {
        return (
            <p>
                <strong>isPending</strong> - the sdk script is loading.
            </p>
        );
    } else if (isResolved) {
        return (
            <p>
                <strong>isResolved</strong> - the sdk script has successfully
                loaded.
            </p>
        );
    } else if (isRejected) {
        return (
            <p>
                <strong>isRejected</strong> - something went wrong. The sdk
                script failed to load.
            </p>
        );
    }

    return null;
}
