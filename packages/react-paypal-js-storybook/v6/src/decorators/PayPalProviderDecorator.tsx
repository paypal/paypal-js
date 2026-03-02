import React, { useEffect } from "react";
import type { Decorator } from "@storybook/react";
import { action } from "storybook/actions";

import {
    PayPalProvider,
    usePayPal,
    useEligibleMethods,
    INSTANCE_LOADING_STATE,
} from "@paypal/react-paypal-js/sdk-v6";
import { PAYPAL_CLIENT_ID } from "../shared/utils";

// Logs SDK and button events to the Actions panel.
function SdkStatusMonitor({ children }: { children: React.ReactNode }) {
    const { loadingStatus } = usePayPal();

    useEligibleMethods({
        payload: {
            currencyCode: "USD",
            paymentFlow: "ONE_TIME_PAYMENT",
        },
    });

    useEffect(() => {
        if (loadingStatus === INSTANCE_LOADING_STATE.RESOLVED) {
            action("SDK")("Library initialized and rendered");
        }
    }, [loadingStatus]);

    const handleClick = (e: React.MouseEvent) => {
        const tag = (e.target as HTMLElement).tagName.toLowerCase();
        if (tag.endsWith("-button")) {
            action("button")(
                "Click event dispatched from the PayPal payment button",
            );
        }
    };

    return <div onClick={handleClick}>{children}</div>;
}

function ProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <PayPalProvider
            clientId={PAYPAL_CLIENT_ID}
            components={[
                "paypal-payments",
                "venmo-payments",
                "paypal-guest-payments",
            ]}
            pageType="checkout"
        >
            <SdkStatusMonitor>{children}</SdkStatusMonitor>
        </PayPalProvider>
    );
}

export const withPayPalProvider: Decorator = (Story) => {
    return (
        <ProviderWrapper>
            <Story />
        </ProviderWrapper>
    );
};
