import React, { useEffect, useRef, useState } from "react";
import { usePayPalScriptReducer } from "../ScriptContext";
import type {
    PayPalMessagesComponentProps,
    PayPalMessagesComponent,
} from "@paypal/paypal-js/types/components/messages";

interface PayPalMessagesReactProps extends PayPalMessagesComponentProps {
    forceReRender?: unknown;
    className?: string;
}

export default function PayPalMessages({
    className = "",
    forceReRender,
    ...messageProps
}: PayPalMessagesReactProps) {
    const [{ isResolved, options }] = usePayPalScriptReducer();
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messages = useRef<PayPalMessagesComponent | null>(null);
    const [, setErrorState] = useState(null);

    useEffect(() => {
        // verify the sdk script has successfully loaded
        if (isResolved === false) {
            return;
        }

        // verify dependency on window.paypal object
        if (
            window.paypal === undefined ||
            window.paypal.Messages === undefined
        ) {
            setErrorState(() => {
                throw new Error(getErrorMessage(options));
            });
            return;
        }

        messages.current = window.paypal.Messages({ ...messageProps });

        if (messagesContainerRef.current === null) {
            return;
        }

        messages.current.render(messagesContainerRef.current).catch((err) => {
            console.error(
                `Failed to render <PayPalMessages /> component. ${err}`
            );
        });
    }, [isResolved, forceReRender]);

    return <div ref={messagesContainerRef} className={className} />;
}

function getErrorMessage({ components = "" }) {
    let errorMessage =
        "Unable to render <PayPalMessages /> because window.paypal.Messages is undefined.";

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
