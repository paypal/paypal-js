import React, { useEffect, useRef, useState, FunctionComponent } from "react";
import { usePayPalScriptReducer } from "../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace } from "../utils";
import { DEFAULT_PAYPAL_NAMESPACE } from "../constants";
import type {
    PayPalButtonsComponent,
    OnInitActions,
} from "@paypal/paypal-js/types/components/buttons";
import type { PayPalButtonsComponentProps } from "../types";

/**
This `<PayPalButtons />` component renders the [Smart Payment Buttons](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#buttons).
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.

Use props for customizing your buttons. For example, here's how you would use the `style`, `createOrder`, and `onApprove` options:

```jsx
    import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

    <PayPalScriptProvider options={{ "client-id": "test" }}>
        <PayPalButtons
            style={{ layout: "horizontal" }}
            createOrder={(data, actions) => {
                return actions.order.create({
                    purchase_units: [
                        {
                            amount: {
                                value: "2.00",
                            },
                        },
                    ],
                });
            }}
        />;
    </PayPalScriptProvider>
```
*/
export const PayPalButtons: FunctionComponent<PayPalButtonsComponentProps> = ({
    className = "",
    disabled = false,
    children,
    forceReRender = [],
    ...buttonProps
}: PayPalButtonsComponentProps) => {
    const buttonsContainerRef = useRef<HTMLDivElement>(null);
    const buttons = useRef<PayPalButtonsComponent | null>(null);

    const [{ isResolved, options }] = usePayPalScriptReducer();
    const [initActions, setInitActions] = useState<OnInitActions | null>(null);
    const [isEligible, setIsEligible] = useState(true);
    const [, setErrorState] = useState(null);

    function closeButtonsComponent() {
        if (buttons.current !== null) {
            buttons.current.close().catch(() => {
                // ignore errors when closing the component
            });
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

        try {
            buttons.current = paypalWindowNamespace.Buttons({
                ...buttonProps,
                onInit: decoratedOnInit,
            });
        } catch (err) {
            return setErrorState(() => {
                throw new Error(
                    `Failed to render <PayPalButtons /> component. Failed to initialize:  ${err}`
                );
            });
        }

        // only render the button when eligible
        if (buttons.current.isEligible() === false) {
            setIsEligible(false);
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
                // paypal buttons container is no longer in the DOM, we can safely ignore the error
                return;
            }
            // paypal buttons container is still in the DOM
            setErrorState(() => {
                throw new Error(
                    `Failed to render <PayPalButtons /> component. ${err}`
                );
            });
        });

        return closeButtonsComponent;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isResolved, ...forceReRender, buttonProps.fundingSource]);

    // useEffect hook for managing disabled state
    useEffect(() => {
        if (initActions === null) {
            return;
        }

        if (disabled === true) {
            initActions.disable().catch(() => {
                // ignore errors when disabling the component
            });
        } else {
            initActions.enable().catch(() => {
                // ignore errors when enabling the component
            });
        }
    }, [disabled, initActions]);

    const isDisabledStyle = disabled ? { opacity: 0.38 } : {};
    const classNames = `${className} ${
        disabled ? "paypal-buttons-disabled" : ""
    }`.trim();

    return (
        <>
            {isEligible ? (
                <div
                    ref={buttonsContainerRef}
                    style={isDisabledStyle}
                    className={classNames}
                />
            ) : (
                children
            )}
        </>
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
