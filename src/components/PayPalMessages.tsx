import React, { useEffect, useRef, useState, FunctionComponent } from "react";
import { usePayPalScriptReducer } from "../ScriptContext";
import { getPayPalWindowNamespace, DEFAULT_PAYPAL_NAMESPACE } from "./utils";
import type {
    PayPalMessagesComponentOptions,
    PayPalMessagesComponent,
} from "@paypal/paypal-js/types/components/messages";

export interface PayPalMessagesComponentProps
    extends PayPalMessagesComponentOptions {
    forceReRender?: unknown[];
    className?: string;
}

export const PayPalMessages: FunctionComponent<PayPalMessagesComponentProps> = ({
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
            options["data-namespace"]
        );

        // verify dependency on window object
        if (
            paypalWindowNamespace === undefined ||
            paypalWindowNamespace.Messages === undefined
        ) {
            setErrorState(() => {
                throw new Error(getErrorMessage(options));
            });
            return;
        }

        messages.current = paypalWindowNamespace.Messages({ ...messageProps });

        if (messagesContainerRef.current === null) {
            return;
        }

        messages.current.render(messagesContainerRef.current).catch((err) => {
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
    }, [isResolved, ...forceReRender]);

    return <div ref={messagesContainerRef} className={className} />;
};

function getErrorMessage({
    components = "",
    "data-namespace": dataNamespace = DEFAULT_PAYPAL_NAMESPACE,
}) {
    let errorMessage = `Unable to render <PayPalMessages /> because window.${dataNamespace}.Messages is undefined.`;

    // the JS SDK does not load the Messages component by default. It must be passed into the "components" query parameter.
    if (!components.includes("messages")) {
        const expectedComponents = components
            ? `${components},messages`
            : "messages";

        errorMessage +=
            "\nTo fix the issue, add 'messages' to the list of components passed to the parent PayPalScriptProvider:" +
            `\n\`<PayPalScriptProvider options={{ components: '${expectedComponents}'}}>\`.`;
    }

    return errorMessage;
}
