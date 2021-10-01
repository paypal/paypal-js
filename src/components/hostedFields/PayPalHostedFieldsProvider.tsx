import React, { useState, useEffect, useRef, Children } from "react";
import type { FC } from "react";

import { PayPalHostedFieldsContext } from "../../context/payPalHostedFieldsContext";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { DATA_NAMESPACE } from "../../constants";
import {
    decorateHostedFields,
    generateHostedFieldsFromChildren,
} from "./utils";
import { validateHostedFieldChildren } from "./validators";
import { SCRIPT_LOADING_STATE } from "../../types/enums";
import type { PayPalHostedFieldsComponentProps } from "../../types/payPalHostedFieldTypes";
import type { HostedFieldsHandler } from "@paypal/paypal-js/types/components/hosted-fields";

/**
 * TODO: Finish the documentation similar to PayPalButtons
 *
 * @param param0
 * @returns
 */
export const PayPalHostedFieldsProvider: FC<PayPalHostedFieldsComponentProps> =
    ({ styles, createOrder, children }) => {
        const childrenList = Children.toArray(children);
        const [{ options, loadingStatus }] = useScriptProviderContext();
        const [cardFields, setCardFields] =
            useState<HostedFieldsHandler | null>(null);
        const [isEligible, setIsEligible] = useState(true);
        const hostedFieldsContainerRef = useRef<HTMLDivElement>(null);
        const [, setErrorState] = useState(null);

        useEffect(() => {
            validateHostedFieldChildren(childrenList);
        }, []); // eslint-disable-line react-hooks/exhaustive-deps

        useEffect(() => {
            // Only render the hosted fields when script is loaded and hostedFields is eligible
            if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) return;
            const hostedFields = decorateHostedFields({
                components: options.components,
                [DATA_NAMESPACE]: options[DATA_NAMESPACE],
            });

            if (!hostedFields.isEligible()) {
                return setIsEligible(false);
            }

            hostedFields
                .render({
                    // Call your server to set up the transaction
                    createOrder: createOrder,
                    styles: styles,
                    fields: generateHostedFieldsFromChildren(childrenList),
                })
                .then((cardFields) => {
                    setCardFields(cardFields);
                })
                .catch((err) => {
                    setErrorState(() => {
                        throw new Error(
                            `Failed to render <PayPalHostedFieldsProvider /> component. ${err}`
                        );
                    });
                });
        }, [loadingStatus, styles]); // eslint-disable-line react-hooks/exhaustive-deps

        return (
            <div ref={hostedFieldsContainerRef}>
                {isEligible && (
                    <PayPalHostedFieldsContext.Provider value={cardFields}>
                        {children}
                    </PayPalHostedFieldsContext.Provider>
                )}
            </div>
        );
    };
