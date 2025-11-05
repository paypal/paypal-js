import React, { useEffect, useRef, useState } from "react";

import { useProxyProps } from "../hooks/useProxyProps";
import { usePayPalScriptReducer } from "../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace, generateErrorMessage } from "../utils";
import { SDK_SETTINGS } from "../constants";
import { useProxyProps } from "../hooks/useProxyProps";

import type { FunctionComponent } from "react";
import type { PayPalButtonsComponent, OnInitActions } from "@paypal/paypal-js";
import type { PayPalButtonsComponentProps } from "../types";

/**
This `<PayPalButtons />` component supports rendering [buttons](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#buttons) for PayPal, Venmo, and alternative payment methods.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
*/
export const PayPalButtons: FunctionComponent<PayPalButtonsComponentProps> = ({
    className = "",
    disabled = false,
    children,
    forceReRender = [],
    ...buttonProps
}: PayPalButtonsComponentProps) => {
    const isDisabledStyle = disabled ? { opacity: 0.38 } : {};
    const classNames = `${className} ${
        disabled ? "paypal-buttons-disabled" : ""
    }`.trim();
    const buttonsContainerRef = useRef<HTMLDivElement>(null);
    const buttons = useRef<PayPalButtonsComponent | null>(null);
    const proxyProps = useProxyProps(buttonProps);

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

    if (buttons.current?.updateProps) {
        buttons.current.updateProps({
            message: buttonProps.message,
        });
    }

    // useEffect hook for rendering the buttons
    useEffect(() => {
        // verify the sdk script has successfully loaded
        if (isResolved === false) {
            return closeButtonsComponent;
        }

        const paypalWindowNamespace = getPayPalWindowNamespace(
            options.dataNamespace,
        );

        // verify dependency on window object
        if (
            paypalWindowNamespace === undefined ||
            paypalWindowNamespace.Buttons === undefined
        ) {
            setErrorState(() => {
                throw new Error(
                    generateErrorMessage({
                        reactComponentName: PayPalButtons.displayName as string,
                        sdkComponentKey: "buttons",
                        sdkRequestedComponents: options.components,
                        sdkDataNamespace: options[SDK_SETTINGS.DATA_NAMESPACE],
                    }),
                );
            });
            return closeButtonsComponent;
        }

        const decoratedOnInit = (
            data: Record<string, unknown>,
            actions: OnInitActions,
        ) => {
            setInitActions(actions);
            if (typeof buttonProps.onInit === "function") {
                buttonProps.onInit(data, actions);
            }
        };

        try {
            buttons.current = paypalWindowNamespace.Buttons({
                ...proxyProps,
                onInit: decoratedOnInit,
            });
        } catch (err) {
            return setErrorState(() => {
                throw new Error(
                    `Failed to render <PayPalButtons /> component. Failed to initialize:  ${err}`,
                );
            });
        }

        // only render the button when eligible
        if (buttons.current.isEligible() === false) {
            setIsEligible(false);
            return closeButtonsComponent;
        }

        if (!buttonsContainerRef.current) {
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
                    `Failed to render <PayPalButtons /> component. ${err}`,
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

PayPalButtons.displayName = "PayPalButtons";
