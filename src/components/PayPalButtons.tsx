import React, { useEffect, useRef, useState } from "react";
import { usePayPalScriptReducer } from "../ScriptContext";
import type {
    PayPalButtonsComponentProps,
    PayPalButtonsComponent,
} from "@paypal/paypal-js/types/components/buttons";

interface PayPalButtonsReactProps extends PayPalButtonsComponentProps {
    /**
     * Used to re-render the component.
     * Changes to this prop will destroy the existing Buttons and render them again using the current props.
     */
    forceReRender?: unknown;
    /**
     * Pass a css class to the div container.
     */
    className?: string;
}

/**
 * This `<PayPalButtons />` component renders the [Smart Payment Buttons](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#buttons).
 * It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
 *
 * Use props for customizing your buttons. For example, here's how you would use the `style` and `createOrder` options:
 *
 * ```jsx
 *     <PayPalButtons style={{ layout: "vertical" }} createOrder={(data, actions) => {}} />
 * ```
 */
export default function PayPalButtons({
    className = "",
    forceReRender,
    ...buttonProps
}: PayPalButtonsReactProps) {
    const [{ isResolved, options }] = usePayPalScriptReducer();
    const buttonsContainerRef = useRef<HTMLDivElement>(null);
    const buttons = useRef<PayPalButtonsComponent | null>(null);
    const [, setErrorState] = useState(null);

    useEffect(() => {
        const cleanup = () => {
            if (buttons.current !== null) {
                buttons.current.close();
            }
        };

        // verify the sdk script has successfully loaded
        if (isResolved === false) {
            return cleanup;
        }

        // verify dependency on window.paypal object
        if (
            window.paypal === undefined ||
            window.paypal.Buttons === undefined
        ) {
            setErrorState(() => {
                throw new Error(getErrorMessage(options));
            });
            return cleanup;
        }

        buttons.current = window.paypal.Buttons({ ...buttonProps });

        // only render the button when eligible
        if (buttons.current.isEligible() === false) {
            return cleanup;
        }

        if (buttonsContainerRef.current === null) {
            return cleanup;
        }

        buttons.current.render(buttonsContainerRef.current).catch((err) => {
            console.error(
                `Failed to render <PayPalButtons /> component. ${err}`
            );
        });

        return cleanup;
    }, [isResolved, forceReRender, buttonProps.fundingSource]);

    return <div ref={buttonsContainerRef} className={className} />;
}

function getErrorMessage({ components = "" }) {
    let errorMessage =
        "Unable to render <PayPalButtons /> because window.paypal.Buttons is undefined.";

    // the JS SDK includes the Buttons component by default when no 'components' are specified.
    // The 'buttons' component must be included in the 'components' list when using it with other components.
    if (components.length && !components.includes("buttons")) {
        const expectedComponents = `${components},buttons`;

        errorMessage +=
            "\nTo fix the issue, add 'buttons' to the list of components passed to the parent PayPalScriptProvider:" +
            `\n\`<PayPalScriptProvider options={{ components: '${expectedComponents}'}}>\`.`;
    }

    return errorMessage;
}
