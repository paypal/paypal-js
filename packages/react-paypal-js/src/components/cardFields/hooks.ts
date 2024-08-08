import { useContext, useRef, useState } from "react";

import {
    PayPalCardFieldsContext,
    PayPalCardFieldsContextType,
} from "./context";
import { CARD_FIELDS_DUPLICATE_CHILDREN_ERROR } from "../../constants";
import {
    FieldComponentName,
    PayPalCardFieldsComponent,
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsIndividualFieldOptions,
    RegisteredFields,
} from "../../types";
import { ignore } from "./utils";

export const usePayPalCardFields = (): PayPalCardFieldsContextType =>
    useContext(PayPalCardFieldsContext);

export type RegistryHookReturnType = {
    fields: RegisteredFields;
    registerField: (
        fieldName: FieldComponentName,
        options: PayPalCardFieldsIndividualFieldOptions,
        cardFields: PayPalCardFieldsComponent | null,
    ) => PayPalCardFieldsIndividualField | void;
    unregisterField: (field: FieldComponentName) => void;
};

export const usePayPalCardFieldsRegistry = (): RegistryHookReturnType => {
    const [, setError] = useState(null);

    const registeredFields = useRef<RegisteredFields>({});

    const registerField = (
        ...props: Parameters<RegistryHookReturnType["registerField"]>
    ) => {
        const [fieldName, options, cardFields] = props;
        if (registeredFields.current[fieldName]) {
            setError(() => {
                throw new Error(CARD_FIELDS_DUPLICATE_CHILDREN_ERROR);
            });
        }

        registeredFields.current[fieldName] = cardFields?.[fieldName](options);
        return registeredFields.current[fieldName];
    };

    const unregisterField = (fieldName: FieldComponentName) => {
        const field = registeredFields.current[fieldName];
        if (field) {
            field.close().catch(ignore);
            delete registeredFields.current[fieldName];
        }
    };

    return {
        fields: registeredFields.current,
        registerField,
        unregisterField,
    };
};
