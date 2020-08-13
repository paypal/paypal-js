import React, { useEffect, useRef } from "react";
import { useScriptReducer } from "../ScriptContext";

export default function Messages() {
    const [{ isLoaded }] = useScriptReducer();
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (isLoaded) {
            // TODO: get message options from props
            const messagingOptions = {
                amount: 500,
                placement: "product",
                style: {
                    layout: "text",
                    logo: {
                        type: "primary",
                        position: "top",
                    },
                },
            };

            window.paypal
                .Messages(messagingOptions)
                .render(messagesContainerRef.current);
        }
    });

    return <div id="paypal-messages" ref={messagesContainerRef} />;
}
