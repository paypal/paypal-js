import React, { useEffect, useRef } from "react";
import { useScriptReducer } from "../ScriptContext";

export default function Messages(props) {
    const [{ isLoaded }] = useScriptReducer(props);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (isLoaded) {
            window.paypal.Messages(props).render(messagesContainerRef.current);
        }
    });

    return <div id="paypal-messages" ref={messagesContainerRef} />;
}
