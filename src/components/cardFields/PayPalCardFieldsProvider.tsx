import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import { PayPalCardFieldsRef, SCRIPT_LOADING_STATE } from "../../types";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace } from "../../utils";
import { SDK_SETTINGS } from "../../constants";
import { generateMissingCardFieldsError } from "./utils";
type ContextState = {
    cardFields: PayPalCardFieldsRef | null;
};
// Create the React context to use in the PayPal card fields provider
const PayPalCardFieldsContext = createContext<ContextState>({
    cardFields: null,
});

export const PayPalCardFieldsProvider = ({
    children,
}: {
    children: ReactNode;
}): JSX.Element => {
    const [{ options, loadingStatus }] = useScriptProviderContext();
    const cardFieldsInstance = useRef<PayPalCardFieldsRef | null>(null);
    const [cardFields, setCardFields] = useState<PayPalCardFieldsRef | null>(
        null
    );
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

        console.log({ current: cardFieldsInstance.current });

        if (!cardFieldsInstance.current) {
            throw new Error(
                generateMissingCardFieldsError({
                    components: options.components,
                    [SDK_SETTINGS.DATA_NAMESPACE]:
                        options[SDK_SETTINGS.DATA_NAMESPACE],
                })
            );
        }

        if (cardFieldsContainerRef.current) {
            setCardFields(cardFieldsInstance.current);
        }
        setIsEligible(cardFieldsInstance.current.isEligible());

        return () => setCardFields(null);
    }, [loadingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
        return <div>loading</div>;
    }

    return (
        <div ref={cardFieldsContainerRef} style={{ width: "100%" }}>
            {isEligible ? (
                <PayPalCardFieldsContext.Provider value={{ cardFields }}>
                    {children}
                </PayPalCardFieldsContext.Provider>
            ) : (
                <div />
            )}
        </div>
    );
};

export const usePayPalCardFieldsContext = (): ContextState =>
    useContext(PayPalCardFieldsContext);
