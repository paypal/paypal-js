import React, { useEffect, useRef } from 'react';
import { useScriptState } from '../ScriptContext';

export default function Messages() {
    const { isLoaded } = useScriptState();
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        if (isLoaded) {
            // TODO: get message options from props
            const messagingOptions = {
                amount: 500,
                placement: 'product',
                style: {
                    layout: 'text',
                    logo: {
                        type: 'primary',
                        position: 'top'
                    }
                }
            };

            window.paypal.Messages(messagingOptions).render(messagesContainerRef.current);
        }
    });

    return <div id="paypal-messages" ref={messagesContainerRef} />;
}
