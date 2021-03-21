import React, { useEffect, useRef, useState, FunctionComponent } from "react";
import { usePayPalScriptReducer } from "../ScriptContext";
import { getPayPalWindowNamespace, DEFAULT_PAYPAL_NAMESPACE } from "./utils";
import type {
    PayPalButtonsComponentProps,
    PayPalButtonsComponent,
    OnInitActions,
} from "@paypal/paypal-js/types/components/buttons";

export interface PayPalButtonsReactProps extends PayPalButtonsComponentProps {
    /**
     * Used to re-render the component.
     * Changes to this prop will destroy the existing Buttons and render them again using the current props.
     */
    forceReRender?: unknown;
    /**
     * Pass a css class to the div container.
     */
    className?: string;
    /**
     * Disables the buttons.
     */
    disabled?: boolean;
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
export const PayPalButtons: FunctionComponent<PayPalButtonsReactProps> = ({
    className = "",
    disabled = false,
    forceReRender,
    ...buttonProps
}: PayPalButtonsReactProps) => {
    const buttonsContainerRef = useRef<HTMLDivElement>(null);
    const buttons = useRef<PayPalButtonsComponent | null>(null);

    const [{ isResolved, options }] = usePayPalScriptReducer();
    const [initActions, setInitActions] = useState<OnInitActions | null>(null);
    const [, setErrorState] = useState(null);

    function closeButtonsComponent() {
        if (buttons.current !== null) {
            buttons.current.close();
        }
    }

    // useEffect hook for rendering the buttons
    useEffect(() => {
        // verify the sdk script has successfully loaded
        if (isResolved === false) {
            return closeButtonsComponent;
        }

        const paypalWindowNamespace = getPayPalWindowNamespace(
            options["data-namespace"]
        );

        // verify dependency on window object
        if (
            paypalWindowNamespace === undefined ||
            paypalWindowNamespace.Buttons === undefined
        ) {
            setErrorState(() => {
                throw new Error(getErrorMessage(options));
            });
            return closeButtonsComponent;
        }

        const decoratedOnInit = (
            data: Record<string, unknown>,
            actions: OnInitActions
        ) => {
            setInitActions(actions);
            if (typeof buttonProps.onInit === "function") {
                buttonProps.onInit(data, actions);
            }
        };

        buttons.current = paypalWindowNamespace.Buttons({
            ...buttonProps,
            onInit: decoratedOnInit,
        });

        // only render the button when eligible
        if (buttons.current.isEligible() === false) {
            return closeButtonsComponent;
        }

        if (buttonsContainerRef.current === null) {
            return closeButtonsComponent;
        }

        buttons.current.render(buttonsContainerRef.current).catch((err) => {
            // component failed to render, possibly because it was closed or destroyed.
            if (
                buttonsContainerRef.current === null ||
                buttonsContainerRef.current.children.length === 0
            ) {
                // paypal button is no longer in the DOM, we can safely ignore the error
                return;
            }
            // paypal button is still in the DOM
            setErrorState(() => {
                throw new Error(
                    `Failed to render <PayPalButtons /> component. ${err}`
                );
            });
        });

        return closeButtonsComponent;
    }, [isResolved, forceReRender, buttonProps.fundingSource]);

    // useEffect hook for managing disabled state
    useEffect(() => {
        if (initActions === null) {
            return;
        }

        if (disabled === true) {
            initActions.disable();
        } else {
            initActions.enable();
        }
    }, [disabled, initActions]);

    const isDisabledStyle = disabled ? { opacity: 0.33 } : {};
    const classNames = `${className} ${
        disabled ? "paypal-buttons-disabled" : ""
    }`.trim();

    return (
        <div
            ref={buttonsContainerRef}
            style={isDisabledStyle}
            className={classNames}
        />
    );
};

function getErrorMessage({
    components = "",
    "data-namespace": dataNamespace = DEFAULT_PAYPAL_NAMESPACE,
}) {
    let errorMessage = `Unable to render <PayPalButtons /> because window.${dataNamespace}.Buttons is undefined.`;

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
