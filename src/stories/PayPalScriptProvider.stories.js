import React from "react";
import { PayPalScriptProvider, usePayPalScriptReducer } from "../index";

export default {
    title: "Example/PayPalScriptProvider",
    component: PayPalScriptProvider,
};

export const Default = () => {
    return (
        <PayPalScriptProvider options={{ "client-id": "test" }}>
            <PrintLoadingState />
            {/* add your paypal components here (ex: <PayPalButtons />) */}
        </PayPalScriptProvider>
    );
};

export const DeferLoading = () => {
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
            options={{ "client-id": "test" }}
        >
            <PrintLoadingState />
            <LoadScriptButton />
        </PayPalScriptProvider>
    );
};

function PrintLoadingState() {
    const [{ isInitial, isPending, isResolved, isRejected }] =
        usePayPalScriptReducer();

    console.log(isPending);

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
