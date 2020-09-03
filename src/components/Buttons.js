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
    createBillingAgreement: PropTypes.func,
    createSubscription: PropTypes.func,
    style: PropTypes.exact({
        color: PropTypes.string,
        height: PropTypes.number,
        label: PropTypes.string,
        layout: PropTypes.string,
        shape: PropTypes.string,
        tagline: PropTypes.bool,
    }),
    shippingPreference: PropTypes.oneOf([
        "GET_FROM_FILE",
        "NO_SHIPPING",
        "SET_PROVIDED_ADDRESS",
    ]),
    onApprove: PropTypes.func,
    onAuth: PropTypes.func,
    onCancel: PropTypes.func,
    onClick: PropTypes.func,
    onError: PropTypes.func,
    onInit: PropTypes.func,
    onShippingChange: PropTypes.func,
    onSuccess: PropTypes.func,
};

Buttons.defaultProps = {
    style: {},
    shippingPreference: "GET_FROM_FILE",
};
