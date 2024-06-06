import React, { useState, useEffect } from "react";

import { SDK_SETTINGS, LOAD_SCRIPT_ERROR } from "../../constants";
import { PayPalButtons } from "../PayPalButtons";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { decorateActions, getBraintreeNamespace } from "./utils";
import { DISPATCH_ACTION } from "../../types";

import type { FC } from "react";
import type {
    BraintreePayPalButtonsComponentProps,
    PayPalButtonsComponentProps,
} from "../../types";

/**
This `<BraintreePayPalButtons />` component renders the [Braintree PayPal Buttons](https://developer.paypal.com/braintree/docs/guides/paypal/overview) for Braintree Merchants.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.

Note: You are able to make your integration using the client token or using the tokenization key.

- To use the client token integration set the key `dataClientToken` in the `PayPayScriptProvider` component's options.
- To use the tokenization key integration set the key `dataUserIdToken` in the `PayPayScriptProvider` component's options.
*/
export const BraintreePayPalButtons: FC<
    BraintreePayPalButtonsComponentProps
> = ({
    className = "",
    disabled = false,
    children,
    forceReRender = [],
    braintreeNamespace,
    merchantAccountId,
    ...buttonProps
}: BraintreePayPalButtonsComponentProps) => {
    const [, setErrorState] = useState(null);
    const [providerContext, dispatch] = useScriptProviderContext();

    useEffect(() => {
        getBraintreeNamespace(braintreeNamespace)
            .then((braintree) => {
                const clientTokenizationKey: string =
                    providerContext.options[SDK_SETTINGS.DATA_USER_ID_TOKEN];
                const clientToken: string =
                    providerContext.options[SDK_SETTINGS.DATA_CLIENT_TOKEN];

                return braintree.client
                    .create({
                        authorization: clientTokenizationKey || clientToken,
                    })
                    .then((clientInstance) => {
                        const merchantProp = merchantAccountId
                            ? { merchantAccountId }
                            : {};

                        return braintree.paypalCheckout.create({
                            ...merchantProp,
                            client: clientInstance,
                        });
                    })
                    .then((paypalCheckoutInstance) => {
                        dispatch({
                            type: DISPATCH_ACTION.SET_BRAINTREE_INSTANCE,
                            value: paypalCheckoutInstance,
                        });
                    });
            })
            .catch((err) => {
                setErrorState(() => {
                    throw new Error(`${LOAD_SCRIPT_ERROR} ${err}`);
                });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providerContext.options]);

    return (
        <>
            {providerContext.braintreePayPalCheckoutInstance && (
                <PayPalButtons
                    className={className}
                    disabled={disabled}
                    forceReRender={forceReRender}
                    {...(decorateActions(
                        buttonProps,
                        providerContext.braintreePayPalCheckoutInstance
                    ) as PayPalButtonsComponentProps)}
                >
                    {children}
                </PayPalButtons>
            )}
        </>
    );
};
