import React, { FC, useState, useEffect } from "react";
import { loadCustomScript } from "@paypal/paypal-js";

import {
    DATA_CLIENT_TOKEN,
    BRAINTREE_SOURCE,
    BRAINTREE_PAYPAL_CHECKOUT_SOURCE,
    LOAD_SCRIPT_ERROR,
} from "../../constants";
import { PayPalButtons } from "../PayPalButtons";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { getBraintreeWindowNamespace } from "../../utils";
import { decorateActions } from "./utils";
import { DISPATCH_ACTION } from "../../types";
import type {
    BraintreePayPalButtonsComponentProps,
    PayPalButtonsComponentProps,
} from "../../types";

/**
This `<BraintreePayPalButtons />` component renders the [Braintree PayPal Buttons](https://developer.paypal.com/braintree/docs/guides/paypal/overview) for Braintree Merchants.
It relies on the `<PayPalScriptProvider />` parent component for managing state related to loading the JS SDK script.
*/
export const BraintreePayPalButtons: FC<BraintreePayPalButtonsComponentProps> =
    ({
        className = "",
        disabled = false,
        children,
        forceReRender = [],
        ...buttonProps
    }: BraintreePayPalButtonsComponentProps) => {
        const [, setErrorState] = useState(null);
        const [providerContext, dispatch] = useScriptProviderContext();

        useEffect(() => {
            Promise.all([
                loadCustomScript({ url: BRAINTREE_SOURCE }),
                loadCustomScript({ url: BRAINTREE_PAYPAL_CHECKOUT_SOURCE }),
            ])
                .then(() => {
                    const clientToken = providerContext.options[
                        DATA_CLIENT_TOKEN
                    ] as string;
                    const braintreeNamespace = getBraintreeWindowNamespace();

                    return braintreeNamespace.client
                        .create({
                            authorization: clientToken,
                        })
                        .then((clientInstance) => {
                            return braintreeNamespace.paypalCheckout.create({
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
        }, [providerContext.options, dispatch]);

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
