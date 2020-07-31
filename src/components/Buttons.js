import React, { useEffect, useRef } from 'react';
import { useScriptState } from '../ScriptContext';

export default function CheckoutButtons(props) {
    const { isLoaded } = useScriptState();
    const buttonsContainerRef = useRef(null);
    const buttons = useRef(null);

    useEffect(() => {
        if (isLoaded) {
            // eslint-disable-next-line react/prop-types
            const { createOrder, style } = props;
            const options = { createOrder, style };
            buttons.current = window.paypal.Buttons(options);
            buttons.current.render(buttonsContainerRef.current);
        } else {
            if (buttons.current) {
                try {
                    buttons.current.close()
                        .then(() => console.log('button cleaned up'));
                } catch (err) {
                    console.log('button cleanup failed', err);
                }

            }
        }
        // TODO: figure out if any cleanup work needs to be done (await buttons.close())
        // return () => {
        //     if (buttons.current) {
        //         buttons.current.close();
        //     }
        // }
    });

    return <div id="paypal-buttons" ref={buttonsContainerRef} />;
}
