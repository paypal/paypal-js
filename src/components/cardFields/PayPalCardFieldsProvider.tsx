import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsRef,
    SCRIPT_LOADING_STATE,
} from "../../types";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace } from "../../utils";
import { SDK_SETTINGS } from "../../constants";
import { generateMissingCardFieldsError } from "./utils";

// Create the React context to use in the PayPal card fields provider
const PayPalCardFieldsContext = createContext<{
    cardFields: PayPalCardFieldsRef | null;
}>({ cardFields: null });

export const PayPalCardFieldsProvider = ({
    children,
}: {
    children: ReactNode;
}): JSX.Element => {
    const [{ options, loadingStatus }] = useScriptProviderContext();
    const cardFieldsRef = useRef<PayPalCardFieldsRef | null>(null);
    const [cardFields, setCardFields] = useState<PayPalCardFieldsRef | null>(
        null
    );
    const [isEligible, setIsEligible] = useState(false);
    const [nameField, setNameField] =
        useState<PayPalCardFieldsIndividualField>();
    const [numberField, setNumberField] =
        useState<PayPalCardFieldsIndividualField>();
    const [cvvField, setCvvField] = useState<PayPalCardFieldsIndividualField>();
    const [expiryield, setExpiryield] =
        useState<PayPalCardFieldsIndividualField>();
    const [shouldMount, setShouldMount] = useState(false);

    async function closeAll() {
        const promises: Promise<void>[] = [];
        if (nameField) {
            promises.push(nameField.close());
        }
        if (numberField) {
            promises.push(numberField.close());
        }
        if (cvvField) {
            promises.push(cvvField.close());
        }
        if (expiryield) {
            promises.push(expiryield.close());
        }
        return await Promise.all(promises);
    }

    // async function closeAll() {
    //     const promises: Promise<void>[] = [];
    //     if (nameField) {
    //         promises.push(nameField.close());
    //     }
    //     if (numberField) {
    //         promises.push(numberField.close());
    //     }
    //     if (cvvField) {
    //         promises.push(cvvField.close());
    //     }
    //     if (expiryield) {
    //         promises.push(expiryield.close());
    //     }
    //     return await Promise.all(promises);
    // }

    useEffect(() => {
        // Only render the hosted fields when script is loaded and hostedFields is eligible
        if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
            return;
        }

        cardFieldsRef.current =
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

        console.log({ current: cardFieldsRef.current });
        setCardFields(() => cardFieldsRef.current ?? null);

        if (!cardFieldsRef.current) {
            throw new Error(
                generateMissingCardFieldsError({
                    components: options.components,
                    [SDK_SETTINGS.DATA_NAMESPACE]:
                        options[SDK_SETTINGS.DATA_NAMESPACE],
                })
            );
        }

        console.log({ isEligible: cardFieldsRef.current.isEligible() });
        setIsEligible(cardFieldsRef.current.isEligible());

        // return () => {
        //     closeAll().catch(() => {
        //         // ignore when closing components
        //     });
        // };
    }, [loadingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
        return <div>loading</div>;
    }

    return (
        <>
            {isEligible ? (
                <PayPalCardFieldsContext.Provider
                    value={{ cardFields: cardFields }}
                >
                    <div style={{ width: "100%" }}>{children}</div>
                </PayPalCardFieldsContext.Provider>
            ) : (
                <div />
            )}
        </>
    );
};

export const usePayPalCardFieldsContext = (): {
    cardFields: PayPalCardFieldsRef | null;
} => useContext(PayPalCardFieldsContext);
