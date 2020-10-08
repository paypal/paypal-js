import React, { useEffect, useRef } from "react";
import { usePayPalScriptReducer } from "../ScriptContext";

export default function PayPalMessages(props) {
    const [{ isLoaded }] = usePayPalScriptReducer();
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (isLoaded) {
            window.paypal
                .Messages({ ...props })
                .render(messagesContainerRef.current);
        }
    });

    return <div ref={messagesContainerRef} />;
}
