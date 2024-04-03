import React, { ReactNode, useEffect, useRef, useState } from "react";

import { SCRIPT_LOADING_STATE } from "../../types";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace } from "../../utils";
import { SDK_SETTINGS } from "../../constants";
import { generateMissingCardFieldsError } from "./utils";
import {
    PayPalCardFieldsContext,
    PayPalCardFieldsContextState,
} from "./context";

export const PayPalCardFieldsProvider = ({
    children,
}: {
    children: ReactNode;
}): JSX.Element => {
    const [{ options, loadingStatus }] = useScriptProviderContext();
    const cardFieldsInstance =
        useRef<PayPalCardFieldsContextState["cardFields"]>(null);

    const cardFieldsContainerRef = useRef<HTMLDivElement>(null);

    const [isEligible, setIsEligible] = useState(false);

    useEffect(() => {
        // Only render the hosted fields when script is loaded and hostedFields is eligible
        if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
            return;
        }

        cardFieldsInstance.current =
            getPayPalWindowNamespace(
                options[SDK_SETTINGS.DATA_NAMESPACE]
            ).CardFields?.({
                createOrder: () => {
                    return;
                },
                onApprove: () => {
                    return;
                },
            }) ?? null;

        if (!cardFieldsInstance.current) {
            throw new Error(
                generateMissingCardFieldsError({
                    components: options.components,
                    [SDK_SETTINGS.DATA_NAMESPACE]:
                        options[SDK_SETTINGS.DATA_NAMESPACE],
                })
            );
        }

        setIsEligible(cardFieldsInstance.current.isEligible());

        // Clean up after component unmounts
        return () => {
            cardFieldsInstance.current = null;
        };
    }, [loadingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
        return <div>loading</div>;
    }

    return (
        <div ref={cardFieldsContainerRef} style={{ width: "100%" }}>
            {isEligible ? (
                <PayPalCardFieldsContext.Provider
                    value={{ cardFields: cardFieldsInstance.current }}
                >
                    {children}
                </PayPalCardFieldsContext.Provider>
            ) : (
                <div />
            )}
        </div>
    );
};
