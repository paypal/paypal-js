import { useContext, useRef, useState } from "react";

import {
    PayPalCardFieldsContext,
    PayPalCardFieldsContextType,
} from "./context";
import { CARD_FIELDS_DUPLICATE_CHILDREN_ERROR } from "../../constants";

export type FieldComponentName =
    | "PayPalCVVField"
    | "PayPalExpiryField"
    | "PayPalNumberField"
    | "PayPalNameField";

export const usePayPalCardFields = (): PayPalCardFieldsContextType =>
    useContext(PayPalCardFieldsContext);

export const usePayPalCardFieldsRegistry = (): {
    registerField: (field: FieldComponentName) => void;
    unregisterField: (field: FieldComponentName) => void;
} => {
    const registeredFields = useRef<Set<FieldComponentName>>(new Set());
    const [, setError] = useState(null);

    const registerField = (fieldName: FieldComponentName) => {
        if (registeredFields.current.has(fieldName)) {
            setError(() => {
                throw new Error(CARD_FIELDS_DUPLICATE_CHILDREN_ERROR);
            });
        }

        registeredFields.current.add(fieldName);
    };

    const unregisterField = (fieldName: FieldComponentName) => {
        if (registeredFields.current.has(fieldName)) {
            registeredFields.current.delete(fieldName);
        }
    };

    return {
        registerField,
        unregisterField,
    };
};
