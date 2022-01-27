import { useRef, MutableRefObject } from "react";

import type { PayPalHostedFieldsRegistered } from "../../types/payPalHostedFieldTypes";

/**
 * Custom hook to store registered hosted fields children
 * Each `PayPalHostedField` component should be registered on the parent provider
 *
 * @param initialValue the initially registered components
 * @returns at first, an {@link Object} containing the registered hosted fields,
 * and at the second a function handler to register the hosted fields components
 */
export const useHostedFieldsRegister = (
    initialValue = {}
): [
    MutableRefObject<PayPalHostedFieldsRegistered>,
    (component: PayPalHostedFieldsRegistered) => void
] => {
    const registeredFields = useRef<PayPalHostedFieldsRegistered>(initialValue);

    const registerHostedField = (component: PayPalHostedFieldsRegistered) => {
        registeredFields.current = {
            ...registeredFields.current,
            ...component,
        };
    };

    return [registeredFields, registerHostedField];
};
