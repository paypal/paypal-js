import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useScriptReducer } from "../ScriptContext";

export default function Buttons(props) {
    const [{ isLoaded }] = useScriptReducer();
    const buttonsContainerRef = useRef(null);
    const buttons = useRef(null);

    useEffect(() => {
        if (isLoaded) {
            buttons.current = window.paypal.Buttons({ ...props });
            buttons.current.render(buttonsContainerRef.current);
        } else {
            // close the buttons when the script is reloaded
            if (buttons.current) {
                buttons.current.close();
            }
        }
        return () => {
            // close the buttons when the component unmounts
            if (buttons.current) {
                buttons.current.close();
            }
        };
    });

    return <div ref={buttonsContainerRef} />;
}

Buttons.propTypes = {
    createOrder: PropTypes.func,
    style: PropTypes.object,
};
