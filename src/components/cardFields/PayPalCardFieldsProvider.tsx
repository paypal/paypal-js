import React, { ReactNode, useEffect, useRef, useState } from "react";

import { SCRIPT_LOADING_STATE } from "../../types";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { getPayPalWindowNamespace } from "../../utils";
import {
    CARD_FIELDS_CHILDREN_ERROR,
    CARD_FIELDS_DUPLICATE_CHILDREN_ERROR,
    SDK_SETTINGS,
} from "../../constants";
import {
    generateMissingCardFieldsError,
    validateHostedFieldsChildren,
    zoidCardFieldsComponents,
    type ZoidCardFieldName,
} from "./utils";
import { FieldComponentName, PayPalCardFieldsContext } from "./context";

import type {
    PayPalCardFieldsComponentOptions,
    PayPalCardFieldsComponent,
    PayPalCardFieldsIndividualField,
} from "@paypal/paypal-js/types/components/card-fields";
import { PayPalCVVField } from "./PayPalCVVField";
import { PayPalNumberField } from "./PayPalNumberField";
import { PayPalNameField } from "./PayPalNameField";
import { PayPalExpiryField } from "./PayPalExpiryField";
import { PayPalCardFieldsRenderStateProvider } from "./PayPalCardFieldsRenderStateProvider";
import { usePayPalCardFieldsRenderState } from "./hooks";

type CardFieldsProviderProps = PayPalCardFieldsComponentOptions & {
    children: ReactNode;
};

export const PayPalCardFieldsProvider = ({
    children,
    ...props
}: CardFieldsProviderProps): JSX.Element => {
    const [{ options, loadingStatus }] = useScriptProviderContext();
    const { registeredFields } = usePayPalCardFieldsRenderState();
    const cardFieldsContainer = useRef<HTMLDivElement>(null);
    const cardFields = useRef<PayPalCardFieldsComponent | null>(null);

    const nameField = useRef<PayPalCardFieldsIndividualField | null>(null);
    const numberField = useRef<PayPalCardFieldsIndividualField | null>(null);
    const cvvField = useRef<PayPalCardFieldsIndividualField | null>(null);
    const expiryField = useRef<PayPalCardFieldsIndividualField | null>(null);

    const nameContainer = useRef<HTMLDivElement>(null);
    const numberContainer = useRef<HTMLDivElement>(null);
    const expiryContainer = useRef<HTMLDivElement>(null);
    const cvvContainer = useRef<HTMLDivElement>(null);

    const [isEligible, setIsEligible] = useState(false);
    // We set the error inside state so that it can be caught by React's error boundary
    const [, setError] = useState(null);

    useEffect(() => {
        // Only render the card fields when script is loaded and cardFields is eligible
        if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
            return;
        }

        try {
            if (cardFieldsContainer.current) {
                cardFields.current =
                    getPayPalWindowNamespace(
                        options[SDK_SETTINGS.DATA_NAMESPACE]
                    ).CardFields?.({
                        ...props,
                    }) ?? null;
            }
        } catch (error) {
            setError(() => {
                throw new Error(
                    `Failed to render <PayPalCardFieldsProvider /> component. Failed to initialize:  ${error}`
                );
            });
            return;
        }

        if (!cardFields.current) {
            setError(() => {
                throw new Error(
                    generateMissingCardFieldsError({
                        components: options.components,
                        [SDK_SETTINGS.DATA_NAMESPACE]:
                            options[SDK_SETTINGS.DATA_NAMESPACE],
                    })
                );
            });
            return;
        }

        setIsEligible(cardFields.current.isEligible());
        validateHostedFieldsChildren({
            numberField,
            cvvField,
            expiryField,
        });

        // Clean up after component unmounts
        return () => {
            cardFields.current = null;
        };
    }, [loadingStatus]); // eslint-disable-line react-hooks/exhaustive-deps

    function validateChildren(
        children: React.ReactChild | React.ReactFragment | React.ReactPortal
    ): void {
        const requiredChildren = {
            PayPalCVVField: 0,
            PayPalNumberField: 0,
            PayPalExpiryField: 0,
            PayPalNameField: 0,
        };
        if (Array.isArray(children)) {
            children.forEach((child) => {
                if (child.type === PayPalCVVField) {
                    requiredChildren["PayPalCVVField"]++;
                }
                if (child.type === PayPalNumberField) {
                    requiredChildren["PayPalNumberField"]++;
                }
                if (child.type === PayPalNameField) {
                    requiredChildren["PayPalNameField"]++;
                }
                if (child.type === PayPalExpiryField) {
                    requiredChildren["PayPalExpiryField"]++;
                }
            });
        }

        const {
            PayPalCVVField,
            PayPalExpiryField,
            PayPalNameField,
            PayPalNumberField,
        } = requiredChildren;

        const hasRequiredFields =
            PayPalCVVField > 0 &&
            PayPalExpiryField > 0 &&
            PayPalNumberField > 0;

        const hasDuplicateChildren =
            PayPalCVVField > 1 ||
            PayPalExpiryField > 1 ||
            PayPalNumberField > 1 ||
            PayPalNameField > 1;

        if (!hasRequiredFields) {
            throw new Error(CARD_FIELDS_CHILDREN_ERROR);
        }

        if (hasDuplicateChildren) {
            throw new Error(CARD_FIELDS_DUPLICATE_CHILDREN_ERROR);
        }
    }

    function validateContainers() {
        if (
            numberContainer.current === null ||
            cvvContainer.current === null ||
            expiryContainer.current === null
        ) {
            throw new Error(CARD_FIELDS_CHILDREN_ERROR);
        }

        const fields: ZoidCardFieldName[] = ["number", "name", "cvv", "expiry"];
        let hasDuplicateChildren = false;

        fields.forEach((fieldName) => {
            const zoidFields = zoidCardFieldsComponents(fieldName);

            const isDuplicate = zoidFields.length > 1;
            if (isDuplicate) {
                hasDuplicateChildren = isDuplicate;
            }
        });

        if (hasDuplicateChildren) {
            throw new Error(CARD_FIELDS_DUPLICATE_CHILDREN_ERROR);
        }
    }

    function validateRegistered(fields: typeof registeredFields) {
        const requiredFields: FieldComponentName[] = [
            "PayPalCVVField",
            "PayPalExpiryField",
            "PayPalNumberField",
        ];

        requiredFields.forEach((fieldName) => {
            if (!fields.current.has(fieldName)) {
                throw new Error(CARD_FIELDS_CHILDREN_ERROR);
            }
        });
    }

    // useEffect(() => {
    //     if (children) {
    //         console.log({ registeredFields });

    //     }
    // }, [children]);

    return (
        <div style={{ width: "100%" }} ref={cardFieldsContainer}>
            <PayPalCardFieldsRenderStateProvider>
                {loadingStatus === SCRIPT_LOADING_STATE.RESOLVED &&
                isEligible ? (
                    <PayPalCardFieldsContext.Provider
                        value={{
                            cardFields,
                            nameField,
                            numberField,
                            cvvField,
                            expiryField,
                            nameContainer,
                            numberContainer,
                            expiryContainer,
                            cvvContainer,
                        }}
                    >
                        {children}
                    </PayPalCardFieldsContext.Provider>
                ) : (
                    <div />
                )}
            </PayPalCardFieldsRenderStateProvider>
        </div>
    );
};
