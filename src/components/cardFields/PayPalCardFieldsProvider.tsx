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
type ContextState = {
    cardFields: PayPalCardFieldsRef | null;
    // nameField: PayPalCardFieldsIndividualField | null;
    // setNameField: React.Dispatch<
    //     React.SetStateAction<PayPalCardFieldsIndividualField | null>
    // >;
    // expiryField: PayPalCardFieldsIndividualField | null;
    // setExpiryField: React.Dispatch<
    //     React.SetStateAction<PayPalCardFieldsIndividualField | null>
    // >;
    // cvvField: PayPalCardFieldsIndividualField | null;
    // setCvvField: React.Dispatch<
    //     React.SetStateAction<PayPalCardFieldsIndividualField | null>
    // >;
    // numberField: PayPalCardFieldsIndividualField | null;
    // setNumberField: React.Dispatch<
    //     React.SetStateAction<PayPalCardFieldsIndividualField | null>
    // >;
};
// Create the React context to use in the PayPal card fields provider
const PayPalCardFieldsContext = createContext<ContextState>({
    cardFields: null,
    // nameField: null,
    // expiryField: null,
    // cvvField: null,
    // numberField: null,
    // setCvvField: () => {
    //     return;
    // },
    // setNameField: () => {
    //     return;
    // },
    // setNumberField: () => {
    //     return;
    // },
    // setExpiryField: () => {
    //     return;
    // },
});

export const PayPalCardFieldsProvider = ({
    children,
}: {
    children: ReactNode;
}): JSX.Element => {
    const [{ options, loadingStatus }] = useScriptProviderContext();
    const cardFieldsRef = useRef<PayPalCardFieldsRef | null>(null);
    // const [cardFields, setCardFields] = useState<PayPalCardFieldsRef | null>(
    //     null
    // );
    const [isEligible, setIsEligible] = useState(false);
    // const [nameField, setNameField] =
    //     useState<PayPalCardFieldsIndividualField | null>(null);
    // const [numberField, setNumberField] =
    //     useState<PayPalCardFieldsIndividualField | null>(null);
    // const [cvvField, setCvvField] =
    //     useState<PayPalCardFieldsIndividualField | null>(null);
    // const [expiryField, setExpiryField] =
    //     useState<PayPalCardFieldsIndividualField | null>(null);
    // const [shouldMount, setShouldMount] = useState(false);

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
    //     if (expiryField) {
    //         promises.push(expiryField.close());
    //     }
    //     return await Promise.all(promises);
    // }

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
    //     if (expiryField) {
    //         promises.push(expiryField.close());
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
        // setCardFields(() => cardFieldsRef.current ?? null);

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
                    value={{
                        cardFields: cardFieldsRef.current ?? null,
                        // nameField,
                        // numberField,
                        // cvvField,
                        // expiryField,
                        // setCvvField,
                        // setExpiryField,
                        // setNameField,
                        // setNumberField,
                    }}
                >
                    <div style={{ width: "100%" }}>{children}</div>
                </PayPalCardFieldsContext.Provider>
            ) : (
                <div />
            )}
        </>
    );
};

export const usePayPalCardFieldsContext = (): ContextState =>
    useContext(PayPalCardFieldsContext);
