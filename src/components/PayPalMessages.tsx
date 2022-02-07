import React, {
    useEffect,
    useRef,
    useState,
    type FunctionComponent,
} from "react";

import { usePayPalScriptReducer } from "../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace, generateErrorMessage } from "../utils";
import { SDK_SETTINGS } from "../constants";

import type {
    PayPalMessagesComponentOptions,
    PayPalMessagesComponent,
} from "@paypal/paypal-js";

export interface PayPalMessagesComponentProps
    extends PayPalMessagesComponentOptions {
    forceReRender?: unknown[];
    className?: string;
}

/**
This `<PayPalMessages />` messages component renders a credit messaging on upstream merchant sites.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
*/
export const PayPalMessages: FunctionComponent<
    PayPalMessagesComponentProps
> = ({
    className = "",
    forceReRender = [],
    ...messageProps
}: PayPalMessagesComponentProps) => {
    const [{ isResolved, options }] = usePayPalScriptReducer();
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messages = useRef<PayPalMessagesComponent | null>(null);
    const [, setErrorState] = useState(null);

    useEffect(() => {
        // verify the sdk script has successfully loaded
        if (isResolved === false) {
            return;
        }

        const paypalWindowNamespace = getPayPalWindowNamespace(
            options[SDK_SETTINGS.DATA_NAMESPACE]
        );

        // verify dependency on window object
        if (
            paypalWindowNamespace === undefined ||
            paypalWindowNamespace.Messages === undefined
        ) {
            return setErrorState(() => {
                throw new Error(
                    generateErrorMessage({
                        reactComponentName:
                            PayPalMessages.displayName as string,
                        sdkComponentKey: "messages",
                        sdkRequestedComponents: options.components,
                        sdkDataNamespace: options[SDK_SETTINGS.DATA_NAMESPACE],
                    })
                );
            });
        }

        messages.current = paypalWindowNamespace.Messages({
            ...messageProps,
        });

        messages.current
            .render(messagesContainerRef.current as HTMLDivElement)
            .catch((err) => {
                // component failed to render, possibly because it was closed or destroyed.
                if (
                    messagesContainerRef.current === null ||
                    messagesContainerRef.current.children.length === 0
                ) {
                    // paypal messages container is no longer in the DOM, we can safely ignore the error
                    return;
                }
                // paypal messages container is still in the DOM
                setErrorState(() => {
                    throw new Error(
                        `Failed to render <PayPalMessages /> component. ${err}`
                    );
                });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isResolved, ...forceReRender]);

    return <div ref={messagesContainerRef} className={className} />;
};

PayPalMessages.displayName = "PayPalMessages";
